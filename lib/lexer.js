'use babel';
/* eslint-disable new-cap */

import { Lexer, Parser, Token } from 'chevrotain';


class Whitespace extends Token {
  static PATTERN = /[ ]+/;
}
class OpenToken extends Token {
  static PATTERN = /\/\/ /;
}
class Position extends Token {
  static PATTERN = Lexer.NA;
}
class StartLinePosition extends Position {
  static PATTERN = /<</;
}
class EndLinePosition extends Position {
  static PATTERN = />>/;
}
class OpenTokenPosition extends Position {
  static PATTERN = /<-/;
}
class CaratPosition extends Position {
  static PATTERN = /\^/;
}
class Period extends Token {
  static PATTERN = /[.]/;
}
class Identifier extends Token {
  static PATTERN = /[a-zA-Z_][a-zA-Z0-9_-]*/;
}
class Modifier extends Token {
  static PATTERN = Lexer.NA;
}
class Only extends Modifier {
  static PATTERN = /only:/;
}
class Equal extends Modifier {
  static PATTERN = /=/;
}
class OpenParens extends Token {
  static PATTERN = /\(/;
}
class CloseParens extends Token {
  static PATTERN = /\)/;
}

const allTokens = [
  Whitespace,
  OpenToken,
  StartLinePosition,
  EndLinePosition,
  OpenTokenPosition,
  CaratPosition,

  Only,
  Equal,
  Identifier,
  Period,
  OpenParens,
  CloseParens,
];


function isCaratLookahead() {
  const result = (
    this.LA(1) instanceof CaratPosition
  ) || (
    this.LA(1) instanceof Whitespace && this.LA(2) instanceof CaratPosition
  );

  return result;
}


export class GrammarParser extends Parser {
  constructor(input) {
    var col = 1;  // eslint-disable-line no-var

    super(input, allTokens, false /* isErrorRecoveryEnabled */);
    const $ = this;
    const openTokenLength = '// '.length;

    this.root = $.RULE('assertion', () => {
      $.OPTION(() => $.SUBRULE($.capturedSpaces));
      $.SUBRULE($.openToken);
      const positions = $.SUBRULE($.positions);
      const scopes = $.SUBRULE($.scopes);
      return [positions, scopes];
    });

    this.capturedSpaces = $.RULE('capturedSpaces', () => {
      const spaces = $.CONSUME(Whitespace);
      col = col + spaces.image.length;
      return spaces;
    });
    this.spaces = $.RULE('spaces', () => $.CONSUME(Whitespace));

    this.openToken = $.RULE('openToken', () => {
      const token = $.CONSUME(OpenToken);
      col = col + token.image.length;
    });

    this.startPosition = $.RULE('startPosition', () => {
      $.CONSUME(StartLinePosition);
      return [0];
    });

    this.endPosition = $.RULE('endPosition', () => {
      $.CONSUME(EndLinePosition);
      return [-1];
    });

    this.openPosition = $.RULE('openPosition', () => {
      $.CONSUME(OpenTokenPosition);
      return [col - openTokenLength];
    });

    this.caratPosition = $.RULE('caratPosition', () => {
      $.OPTION(() => $.SUBRULE($.capturedSpaces));
      const carat = $.CONSUME(CaratPosition);
      col = col + carat.image.length;
      return col;
    });

    this.caratPositions = $.RULE('caratPositions', () => {
      const positions = [];
      $.AT_LEAST_ONE(isCaratLookahead, () => {
        const pos = $.SUBRULE(this.caratPosition);
        positions.push(pos);
      }, 'caratPosition');
      return positions;
    });

    this.positions = $.RULE('positions', () => $.OR([
      { ALT: () => $.SUBRULE($.startPosition) },
      { ALT: () => $.SUBRULE($.endPosition) },
      { ALT: () => $.SUBRULE($.openPosition) },
      { ALT: () => $.SUBRULE($.caratPositions) },
    ]));


    this.only = $.RULE('only', () => {
      $.OR([
        { ALT: () => $.CONSUME(Only) },
        { ALT: () => $.CONSUME(Equal) },
      ]);

      return '=';
    });

    this.modifier = $.RULE('modifier', () => $.SUBRULE($.only));

    this.scopeSuffix = $.RULE('scopeSuffix', () => {
      const period = $.CONSUME(Period);
      const identifier = $.CONSUME(Identifier);
      return period.image + identifier.image;
    });

    this.scope = $.RULE('scope', () => {
      const identifier = $.CONSUME(Identifier);
      let scope = identifier.image;
      $.MANY(() => {
        const suffix = $.SUBRULE($.scopeSuffix);
        scope = scope + suffix;
      });
      return scope;
    });

    this.scopeWithSpace = $.RULE('scopeWithSpace', () => {
      $.OPTION(() => $.SUBRULE($.spaces));
      return $.SUBRULE($.scope);
    });

    this.singleScope = $.RULE('singleScope', () => {
      const scope = $.SUBRULE($.scope);
      return [scope];
    });

    this.multiScopes = $.RULE('multiScopes', () => {
      const scopes = [$.SUBRULE($.scope)];
      $.MANY(() => {
        const scope = $.SUBRULE($.scopeWithSpace);
        scopes.push(scope);
      });
      return scopes;
    });

    this.groupedScopes = $.RULE('groupedScopes', () => {
      $.CONSUME(OpenParens);
      const scopes = $.SUBRULE($.multiScopes);
      $.CONSUME(CloseParens);
      return scopes;
    });

    this.modifiedScopes = $.RULE('modifiedScopes', () => {
      const modifier = $.SUBRULE($.modifier);
      const scopes = $.OR([
        { ALT: () => $.SUBRULE($.groupedScopes) },
        { ALT: () => $.SUBRULE($.singleScope) },
      ]);

      return [modifier, scopes];
    });

    this.unmodifiedScopes = $.RULE('unmodifiedScopes', () => {
      const scopes = $.OR([
        { ALT: () => $.SUBRULE($.groupedScopes) },
        { ALT: () => $.SUBRULE($.multiScopes) },
      ]);
      return ['@', scopes];
    });

    this.scopes = $.RULE('scopes', () => {
      $.SUBRULE($.spaces);
      return $.OR([
        { ALT: () => $.SUBRULE($.modifiedScopes) },
        { ALT: () => $.SUBRULE($.unmodifiedScopes) },
      ]);
    });

    Parser.performSelfAnalysis(this);
  }
}

const lexer = new Lexer(allTokens);

export function lex(input) {
  const result = lexer.tokenize(input);
  if (result.errors.length) {
    throw Error(result.errors.join('\n'));
  }
  return result.tokens;
}

export function parse(tokens) {
  const parser = new GrammarParser(tokens);
  const result = parser.root();
  if (parser.errors.length) {
    throw Error(parser.errors.join('\n'));
  }
  return result;
}
