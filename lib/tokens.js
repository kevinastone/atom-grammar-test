'use babel';

class Token {
  constructor(start, end, ...scopes) {
    this.start = start;
    this.end = end;
    this.scopes = scopes;
  }

  matches(column) {
    return this.start <= column && column < this.end;
  }
}


export class StartLineToken {
  constructor(...scopes) {
    this.scopes = scopes;
  }

  matches(column) {
    return column === 0;
  }
}


export class EndLineToken {
  constructor(...scopes) {
    this.scopes = scopes;
  }

  matches(column) {
    return column === -1;
  }
}


export function segmentTokens(tokens, startScopes, endScopes) {
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
