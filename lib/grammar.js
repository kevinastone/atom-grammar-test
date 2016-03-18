'use babel';
/* eslint-disable new-cap */

import { Lexer, Parser, Token, EOF } from 'chevrotain';


class Whitespace extends Token {
  static PATTERN = /[ ]+/;
}
class Position extends Token {
  static PATTERN = Lexer.NA;
}
class StartOfLine extends Position {
  static PATTERN = /<</;
  static LABEL = '<<';
}
class EndOfLine extends Position {
  static PATTERN = />>/;
  static LABEL = '>>';
}
class Beginning extends Position {
  static PATTERN = /<-/;
  static LABEL = '<-';
}
class Carat extends Position {
  static PATTERN = /\^/;
  static LABEL = '^';
}
class Period extends Token {
  static PATTERN = /[.]/;
  static LABEL = '.';
}
class Identifier extends Token {
  static PATTERN = /[a-zA-Z_][a-zA-Z0-9_-]*/;
}
class Modifier extends Token {
  static PATTERN = Lexer.NA;
}
class Only extends Modifier {
  static PATTERN = /only:|=/;
  static LABEL = '=';
}
class Not extends Modifier {
  static PATTERN = /not:|!/;
  static LABEL = '!';
}
class OpenParens extends Token {
  static PATTERN = /\(/;
  static LABEL = '(';
}
class CloseParens extends Token {
  static PATTERN = /\)/;
  static LABEL = ')';
}


function isCaratLookahead() {
  const result = (
    this.LA(1) instanceof Carat
  ) || (
    this.LA(1) instanceof Whitespace && this.LA(2) instanceof Carat
  );

  return result;
}


export default function(openToken, closeToken = null) {
  class Comment extends Token {
    static PATTERN = new RegExp(openToken);
  }

  class EndComment extends EOF {
    static PATTERN = closeToken ? new RegExp(closeToken) : Lexer.NA;
  }

  const allTokens = [
    Comment,
    EndComment,
    Whitespace,
    StartOfLine,
    EndOfLine,
    Beginning,
    Carat,
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
        $.OPTION(() => $.CONSUME(Whitespace));
        $.CONSUME(Comment);
        const positions = $.SUBRULE($.positions);
        $.CONSUME2(Whitespace);
        const scopes = $.SUBRULE($.rules);
        // Need to force consuming EOF to capture an optional close token
        $.CONSUME(EOF);
        return [positions, scopes];
      });

      this.positions = $.RULE('positions', () => $.OR([
        { ALT: () => {
          $.CONSUME(StartOfLine);
          return [0];
        } },
        { ALT: () => {
          $.CONSUME(EndOfLine);
          return [-1];
        } },
        { ALT: () => {
          const token = $.CONSUME(Beginning);
          return [token.startColumn - openTokenLength];
        } },
        { ALT: () => {
          const positions = [];
          $.AT_LEAST_ONE(isCaratLookahead, () => {
            $.OPTION(() => $.CONSUME(Whitespace));
            const carat = $.CONSUME(Carat);
            positions.push(carat.endColumn);
          }, 'Carat');
          return positions;
        } },
      ]));

      this.scope = $.RULE('scope', () => {
        const idents = [];
        $.AT_LEAST_ONE_SEP(Period, () => {
          idents.push($.CONSUME(Identifier).image);
        }, 'parts');
        return idents.join('.');
      });

      this.scopes = $.RULE('scopes', () => {
        const scopes = [$.SUBRULE($.scope)];
        $.MANY(() => {
          $.CONSUME(Whitespace);
          const scope = $.SUBRULE2($.scope);
          scopes.push(scope);
        });
        return scopes;
      });

      this.rules = $.RULE('rules', () => $.OR([
        { ALT: () => {
          const modifier = $.OR2([
            { ALT: () => {
              $.CONSUME(Only);
              return '=';
            } },
            { ALT: () => {
              $.CONSUME(Not);
              return '!';
            } },
          ]);
          const scopes = $.OR3([
            { ALT: () => {
              $.CONSUME(OpenParens);
              const innerScopes = $.SUBRULE2($.scopes);
              $.CONSUME(CloseParens);
              return innerScopes;
            } },
            { ALT: () => {
              const scope = $.SUBRULE($.scope);
              return [scope];
            } },
          ]);

          return [modifier, scopes];
        } },
        { ALT: () => {
          const scopes = $.OR4([
            { ALT: () => {
              $.CONSUME2(OpenParens);
              const innerScopes = $.SUBRULE3($.scopes);
              $.CONSUME2(CloseParens);
              return innerScopes;
            } },
            { ALT: () => $.SUBRULE($.scopes) },
          ]);
          return ['@', scopes];
        } },
      ]));

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
    Parser: GrammarParser,
  };
}
