'use babel';

/* @flow */

/* ::
interface AtomToken {
  value: string;
  scopes: Array<string>;
}
*/

export class Token {
  /* ::
    start: number;
    end: number;
    scopes: Array<string>;
  */
  constructor(start /* : number */, end /* : number */, ...scopes /* : Array<string> */) {
    this.start = start;
    this.end = end;
    this.scopes = scopes;
  }

  matches(column /* : number */) /* : boolean */ {
    return this.start <= column && column < this.end;
  }
}


export class StartLineToken extends Token {
  constructor(...scopes /* : Array<string> */) {
    super(0, 1, ...scopes);
  }

  matches(column /* : number */) /* : boolean */ {
    return column === 0;
  }
}


export class EndLineToken extends Token {
  constructor(...scopes /* : Array<string> */) {
    super(-1, 0, ...scopes);
  }

  matches(column /* : number */) /* : boolean */ {
    return column === -1;
  }
}


export function segmentTokens(
  tokens /* : Array<AtomToken> */,
  startScopes /* : Array<string> */,
  endScopes /* : Array<string> */
) /* : Array<Token> */ {
  let columnNumber = 1;
  return Array.prototype.concat.call(
    [new StartLineToken(...startScopes)],
    tokens.map((token) => {
      const start = columnNumber;
      columnNumber += token.value.length;
      const end = columnNumber;
      return new Token(start, end, ...token.scopes);
    }),
    [new EndLineToken(...endScopes)],
  );
}
