'use babel';
/* @flow */
/* eslint-disable new-cap */

import { Lexer, Parser, Token, EOF } from 'chevrotain';


class Whitespace extends Token {
  static PATTERN = /[ ]+/;
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

  code() {
    throw Error('Must implement in sub-class');
  }
}
class Only extends Modifier {
  static PATTERN = /only:|=/;

  code() {
    return '=';
  }
}
class Not extends Modifier {
  static PATTERN = /not:|!/;

  code() {
    return '!';
  }
}
class OpenParens extends Token {
  static PATTERN = /\(/;
}
class CloseParens extends Token {
  static PATTERN = /\)/;
}


function isCaratLookahead() {
  const result = (
    this.LA(1) instanceof CaratPosition
  ) || (
    this.LA(1) instanceof Whitespace && this.LA(2) instanceof CaratPosition
  );

  return result;
}

/* ::

export type TModifier = "@" | "=";
type TParserResult = [Array<number>, [TModifier, Array<string>]];

export type TLexer = (text: string) => Array<Token>;
export type TParser = (tokens: Array<Token>) => TParserResult;
*/


export default function(openToken /* : string */, closeToken /* : ?string */ = null) /* : {parse: TParser, lex: TLexer} */ {
  class OpenToken extends Token {
    static PATTERN = new RegExp(openToken);
  }

  class CloseToken extends EOF {
    static PATTERN = closeToken ? new RegExp(closeToken) : Lexer.NA;
  }

  const allTokens = [
    OpenToken,
    CloseToken,
    Whitespace,
    StartLinePosition,
    EndLinePosition,
    OpenTokenPosition,
    CaratPosition,
    Modifier,
    Only,
    Not,
    Identifier,
    Period,
    OpenParens,
    CloseParens,
  ];

  const lexer = new Lexer(allTokens);

  class GrammarParser extends Parser {
    constructor(input) {
      super(input, allTokens, false /* isErrorRecoveryEnabled */);
      const $ = this;
      const openTokenLength = openToken.length;

      this.root = $.RULE('assertion', () => {
        $.OPTION(() => $.SUBRULE($.spaces));
        $.SUBRULE($.openToken);
        const positions = $.SUBRULE($.positions);
        const scopes = $.SUBRULE($.scopes);
        // Need to force consuming EOF to capture an optional close token
        $.CONSUME(EOF);
        return [positions, scopes];
      });

      this.spaces = $.RULE('spaces', () => $.CONSUME(Whitespace));

      this.openToken = $.RULE('openToken', () => $.CONSUME(OpenToken));
      this.closeToken = $.RULE('closeToken', () => $.CONSUME(CloseToken));

      this.startPosition = $.RULE('startPosition', () => {
        $.CONSUME(StartLinePosition);
        return [0];
      });

      this.endPosition = $.RULE('endPosition', () => {
        $.CONSUME(EndLinePosition);
        return [-1];
      });

      this.openPosition = $.RULE('openPosition', () => {
        const token = $.CONSUME(OpenTokenPosition);
        return [token.startColumn - openTokenLength];
      });

      this.caratPosition = $.RULE('caratPosition', () => {
        $.OPTION(() => $.SUBRULE($.spaces));
        const carat = $.CONSUME(CaratPosition);
        return carat.endColumn;
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


      this.modifier = $.RULE('modifier', () => {
        const modifier = $.CONSUME(Modifier);
        return modifier.code();
      });

      this.scope = $.RULE('scope', () => {
        const idents = [];
        $.AT_LEAST_ONE_SEP(Period, () => {
          idents.push($.CONSUME(Identifier).image);
        }, 'parts');
        return idents.join('.');
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

  function lex(input) {
    const result = lexer.tokenize(input);
    if (result.errors.length) {
      throw Error(result.errors.join('\n'));
    }
    return result.tokens;
  }

  function parse(tokens) {
    const parser = new GrammarParser(tokens, allTokens);
    const result = parser.root();
    if (parser.errors.length) {
      throw Error(parser.errors.join('\n'));
    }
    return result;
  }

  return {
    lex,
    parse,
  };
}
