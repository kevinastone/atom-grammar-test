'use babel';


const HEADER_REGEX = /^(\S+?)\s+SYNTAX TEST\s+(['"])([^\2]+)\2\s*(\S*)$/i;


class Header {
  constructor(headerLine) {
    const config = HEADER_REGEX.exec(headerLine);
    if (!config) {
      throw Error(`Invalid header: ${headerLine}`);
    }
    const [_ignore1, openToken, _ignore2, scope, closeToken] = config;
    this.scope = scope;
    this.openToken = openToken;
    this.closeToken = closeToken;
  }

  toString() {
    return `${this.openToken}SYNTAX TEST "${this.scope}"${this.closeToken}`;
  }
}


class Parser {
  constructor(lineIterator) {
    this.iterator = lineIterator;
    this.filename = lineIterator.filename;
    const { value, done } = this.iterator.next();

    if (done) {
      throw Error(`${this.filename} was empty`);
    }

    try {
      this.header = new Header(value);
    } catch (_ex) {
      throw Error(`${this.filename} is not a Syntax Test: ${value}`);
    }
    this.lineNumber = 1;
  }

  * [Symbol.iterator]() {
    for (const line of this.iterator) {
      this.lineNumber += 1;
      yield {
        lineNumber: this.lineNumber,
        line,
      };
    }
  }
}


export function parse(iterator) {
  return new Parser(iterator);
}
