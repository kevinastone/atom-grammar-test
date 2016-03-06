'use babel';
/* @flow */


const HEADER_REGEX = /^(\S+?)\s+SYNTAX TEST\s+(['"])([^\2]+)\2\s*(\S*)$/i;

/* ::
import type { LineIterator } from './io';

export interface Line {
  lineNumber: number;
  line: string;
}
*/


export class Header {
  /* ::
  scope: string;
  openToken: string;
  closeToken: string;
  */
  constructor(headerLine /* : string */) {
    const config = HEADER_REGEX.exec(headerLine);
    if (!config) {
      throw Error(`Invalid header: ${headerLine}`);
    }
    const [_ignore1, openToken, _ignore2, scope, closeToken] = config;
    this.scope = scope;
    this.openToken = openToken;
    this.closeToken = closeToken;
  }

  toString() /* : string */ {
    return `${this.openToken}SYNTAX TEST "${this.scope}"${this.closeToken}`;
  }
}


class Parser {
  /* ::
  iterator: LineIterator;
  filename: string;
  header: Header;
  lineNumber: number;

  @@iterator(): Iterator<Line> {
    return this._iterate();
  };
  */
  constructor(lineIterator /* : LineIterator */) {
    this.iterator = lineIterator;
    this.filename = lineIterator.filename;
    const { value, done } = this.iterator.next();

    if (done || !value) {
      throw Error(`${this.filename} was empty`);
    }

    try {
      this.header = new Header(value);
    } catch (_ex) {
      throw Error(`${this.filename} is not a Syntax Test: ${value}`);
    }
    this.lineNumber = 1;
  }

  * _iterate() /* : Iterator<Line> */ {
    for (const line of this.iterator) {
      this.lineNumber += 1;
      yield {
        lineNumber: this.lineNumber,
        line,
      };
    }
  }

  // $FlowIssue
  * [Symbol.iterator]() {
    yield* this._iterate();
  }
}

/* ::

export interface HeaderIterable extends Iterable<Line> {
  header: Header;
}
*/

export function parse(iterator /* : LineIterator */) /* : HeaderIterable */ {
  return new Parser(iterator);
}
