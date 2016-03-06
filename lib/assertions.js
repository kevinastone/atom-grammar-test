'use babel';
/* @flow */

import parser from './grammar';
import { matcherBuilder } from './matchers';

/* ::
import type { Modifier } from './matchers';

interface Matcher {
  scopes: Array<string>;
  message(): string;
}

import type { Header, HeaderIterable, Line } from './parser';

interface ParsedLine extends Line {
  assertions: Array<Assertion>;
}
*/

class Assertion {
  /* ::
  line: number;
  column: number;
  matcher: Matcher;
  */
  constructor(line, column, matcher) {
    this.line = line;
    this.column = column;
    this.matcher = matcher;
  }

  findToken(...tokens) {
    return tokens.filter((token) => token.matches(this.column)).shift();
  }

  message() {
    return `${this.matcher.message()} at ${this.line}:${this.column}`;
  }
}


export class AssertionParser {
  /* ::
  header: Header;
  regex: RegExp;
  iterator: Iterator<Line>;

  @@iterator(): Iterator<ParsedLine> {
    return this._iterate();
  };
  */
  constructor(iterator /* : HeaderIterable */) {
    this.header = iterator.header;
    const { lex, parse } = parser(this.header.openToken, this.header.closeToken);
    this.lex = lex;
    this.parse = parse;
    this.iterator = iterator[Symbol.iterator]();
  }

  // $FlowIssue
  *[Symbol.iterator]() /* : Iterator<ParsedLine> */ {
    yield* this._iterate();
  }

  *_iterate() /* : Iterator<ParsedLine> */ {
    let currentLine = undefined;

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
