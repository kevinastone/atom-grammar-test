'use babel';

import parse from './grammar';
import { matchScopes } from './scope';


export class Assertion {
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

  findToken(...tokens) {
    let columnNumber = 1;

    return tokens.filter((token) => {
      const startColumnNumber = columnNumber;
      const endColumnNumber = columnNumber + token.value.length;
      columnNumber = endColumnNumber;

      return startColumnNumber <= this.column && this.column < endColumnNumber;
    }).shift();
  }

  message() {
    return `${this.scopes.join(', ')} at ${this.line}:${this.column}`;
  }
}


export class AssertionParser {
  constructor(iterator) {
    this.header = iterator.header;
    this.regex = new RegExp(
      `^(\\s*)${this.header.openToken}(.+?)${this.header.closeToken}$`
    );
    this.iterator = iterator[Symbol.iterator]();
  }

  parseLine(line) {
    const match = this.regex.exec(line);
    if (!match) {
      throw Error();
    }

    const [_match, leadingWhitespace, expression] = match;
    const [positions, scopes] = parse.parse(expression);

    return [
      positions.map((p) => leadingWhitespace.length + (p > 0 ? p + this.header.openToken.length : 1)),
      scopes,
    ];
  }

  *[Symbol.iterator]() {
    let currentLine = undefined;

    for (const value of this.iterator) {
      try {
        const [positions, scopes] = this.parseLine(value.line);
        if (!currentLine) {
          throw Error("Can't have assertion before any syntax");
        }

        for (const position of positions) {
          currentLine.assertions.push(
            new Assertion(currentLine.lineNumber, position, ...scopes)
          );
        }
      } catch (_e) {
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
