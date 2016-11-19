'use babel';

import parser from './grammar';
import { matcherBuilder } from './matchers';


class Assertion {
  constructor(line, column, matcher) {
    this.line = line;
    this.column = column;
    this.matcher = matcher;
  }

  findToken(...tokens) {
    return tokens.filter(token => token.matches(this.column)).shift();
  }

  message() {
    return `${this.matcher.message()} at ${this.line}:${this.column}`;
  }
}


export class AssertionParser {
  constructor(iterator) {
    this.header = iterator.header;
    const { lex, parse } = parser(this.header.openToken, this.header.closeToken);
    this.lex = lex;
    this.parse = parse;
    this.iterator = iterator[Symbol.iterator]();
  }

  * [Symbol.iterator]() {
    let currentLine;

    for (const value of this.iterator) {
      try {
        const [positions, [modifier, scopes]] = this.parse(this.lex(value.line));
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
