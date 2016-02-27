'use babel';

import { matchScopes, parseScopes } from './scope';


class Assertion {
  constructor(line, column, ...scopes) {
    this.line = line;
    this.column = column;
    this.scopes = scopes;
  }

  findMissing(...scopes) {
    return this.scopes.filter((expected) =>
      !scopes.some((actual) =>
        matchScopes(actual, expected)
      )
    );
  }

  message() {
    return `${this.scopes.join(', ')} at ${this.line}:${this.column}`;
  }
}


export class AssertionParser {
  constructor(iterator) {
    this.header = iterator.header;
    this.regex = new RegExp(
      `^(\\s*)${this.header.openToken}(<-|(?:\\s*(\\^+)))(.+)${this.header.closeToken}$`
    );
    this.iterator = iterator[Symbol.iterator]();
  }

  *[Symbol.iterator]() {
    let currentLine = undefined;

    for (;;) {
      const { value, done } = this.iterator.next();
      if (done) {
        break;
      }

      const match = this.regex.exec(value.line);
      if (match) {
        if (!currentLine) {
          throw Error("Can't have assertion before any syntax");
        }
        const [_ignore, leadingWhitespace, operator, carets, scopes] = match;

        let columnNumber = 1 + leadingWhitespace.length;
        if (operator !== '<-') {
          columnNumber += this.header.openToken.length + operator.length - carets.length;
        }

        currentLine.assertions.push(
          new Assertion(currentLine.lineNumber, columnNumber, ...parseScopes(scopes))
        );
      } else {
        if (currentLine) {
          yield currentLine;
        }
        currentLine = Object.assign({}, { assertions: [] }, value);
      }
    }

    if (currentLine) {
      yield currentLine;
    }
  }
}
