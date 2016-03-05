'use babel';

import parse from './grammar';
import { matcherBuilder } from './matchers';


class Assertion {
  constructor(line, column, matcher) {
    this.line = line;
    this.column = column;
    this.matcher = matcher;
  }

  findToken(...tokens) {
    return tokens.filter((token) => token.matches(this.column)).shift();
  }

  message() {
    return `${this.matcher.scopes.join(', ')} at ${this.line}:${this.column}`;
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
      positions.map((p) => {
        if (p <= 0) {
          // start/end line indicators
          return p;
        } else if (p === 1) {
          // open token indicator
          return p + leadingWhitespace.length;
        }
        // carat indicator (includes open token, but move back 1 col to start of character)
        return p + leadingWhitespace.length + this.header.openToken.length - 1;
      }),
      scopes,
    ];
  }

  *[Symbol.iterator]() {
    let currentLine = undefined;

    for (const value of this.iterator) {
      try {
        const [positions, [modifier, scopes]] = this.parseLine(value.line);
        if (!currentLine) {
          throw Error("Can't have assertion before any syntax");
        }

        const matcher = matcherBuilder(modifier, ...scopes);

        for (const position of positions) {
          currentLine.assertions.push(
            new Assertion(currentLine.lineNumber, position, matcher)
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
