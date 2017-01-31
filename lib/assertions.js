'use babel';

/* @flow */

import parser from './grammar';
import { matcherBuilder } from './matchers';

/* ::
import type { TParser, TLexer } from './grammar';

import type { TModifier as Modifier } from './grammar';
import { Matcher } from './matchers';

import type { HeaderType, HeaderIterator, Line } from './parser';
import { Token } from './tokens';

interface ParsedLine extends Line {
  assertions: Array<Assertion>;
}
*/

export class Assertion {
  /* ::
  line: number;
  column: number;
  matcher: Matcher;
  */
  constructor(line /* : number */, column /* : number */, matcher /* : Matcher */) {
    this.line = line;
    this.column = column;
    this.matcher = matcher;
  }

  findToken(...tokens /* : Array<Token> */) /* : ?Token */ {
    return tokens.filter(token => token.matches(this.column)).shift();
  }

  message() /* : string */ {
    return `${this.matcher.message()} at ${this.line}:${this.column}`;
  }
}


export class AssertionParser {
  /* ::
  header: HeaderType;
  lex: TLexer;
  parse: TParser;
  iterator: Iterable<Line>;

  @@iterator(): * {
    return this._iterate();
  };
  */
  constructor(iterator /* : HeaderIterator */) {
    this.header = iterator.header;
    const { lex, parse } = parser(this.header.openToken, this.header.closeToken);
    this.lex = lex;
    this.parse = parse;
    this.iterator = iterator;
  }

  // $FlowIssue
  * [Symbol.iterator]() /* : Iterable<ParsedLine> */ {
    yield* this._iterate();
  }

  * _iterate() /* : Iterable<ParsedLine> */ {
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
