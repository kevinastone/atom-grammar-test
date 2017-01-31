'use babel';

/* @flow */

import { AssertionParser } from '../lib/assertions';
import { Not, Only } from '../lib/matchers';
import { parsedLineFixture } from './utils';

/* ::
import type { HeaderType, HeaderIterator } from '../lib/parser';
*/

// Neeed to fake Flow out
function _annotateIterator(
  iterator /* : any */,
  header /* : HeaderType */
)/* : HeaderIterator */ {
  return Object.assign(iterator, { header });
}


function parserFixture(openToken, closeToken, ...lines) {
  const header/* : HeaderType */ = {
    openToken,
    closeToken,
    scope: 'source.c',
  };

  const iterator = _annotateIterator(
    parsedLineFixture('blah.txt', ...lines), header
  );
  return new AssertionParser(iterator);
}


describe('Assertions', () => {
  describe('AssertionParser', () => {
    it('should only return source lines', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma',
        '// ^ keyword.control.directive.pragma'
      );
      expect(
        Array.from(parser).map(item => item.line)
      ).toEqual([
        '#pragma once',
      ]);
    });

    it('should parse alternative open and close tokens', () => {
      const parser = parserFixture('<!-- ', ' -->',
        '<script> console.log("hi"); </script>',
        '<!-- << =text.html.basic -->',
        '<!-- >> !source.js.embedded.html -->',
        '<!-- >> =text.html.basic -->',
      );

      const assertions = Array.from(parser)[0].assertions;
      expect(assertions.length).toEqual(3);
    });

    it('should map assertions onto the source line', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma',
        '// ^ keyword.control.directive.pragma'
      );

      const assertions = Array.from(parser)[0].assertions;
      expect(assertions.length).toEqual(3);
    });

    it('should parse << assertions', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// << punctuation.definition.directive meta.preprocessor.c'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'punctuation.definition.directive',
        'meta.preprocessor.c',
      ]);
      expect(assertion.column).toEqual(0);
    });

    it('should parse << assertions with leading whitespace', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        ' // << keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(0);
    });

    it('should parse >> assertions', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// >> punctuation.definition.directive meta.preprocessor.c'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'punctuation.definition.directive',
        'meta.preprocessor.c',
      ]);
      expect(assertion.column).toEqual(-1);
    });

    it('should parse >> assertions with leading whitespace', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        ' // >> keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(-1);
    });

    it('should parse <- assertions', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'punctuation.definition.directive',
        'meta.preprocessor.c',
      ]);
      expect(assertion.column).toEqual(1);
    });

    it('should parse <- assertions with leading whitespace', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        ' // <- keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(2);
    });

    it('should parse ^ assertions', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// ^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(4);
    });

    it('should parse ^ assertions with leading whitespace', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '  // ^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(6);
    });

    it('should parse ^ assertions with prefixed whitespace whitespace', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '//    ^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(7);
    });

    it('should parse ^^+ assertions', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// ^^^^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(4);
    });

    it('should parse multiple carats separated by spaces (^   ^ some.rule)', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// ^     ^ some.symbol'
      );

      const assertions = Array.from(parser)[0].assertions;
      expect(assertions.length).toBe(2);
      const [assertion1, assertion2] = assertions;
      expect(assertion1.matcher.scopes).toEqual([
        'some.symbol',
      ]);
      expect(assertion1.column).toEqual(4);

      expect(assertion2.matcher.scopes).toEqual([
        'some.symbol',
      ]);
      expect(assertion2.column).toEqual(10);
    });

    it('should parse only modifiers', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// ^ =something.else'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher instanceof Only).toBeTruthy();
      expect(assertion.matcher.scopes).toEqual([
        'something.else',
      ]);
    });

    it('should parse not modifiers', () => {
      const parser = parserFixture('// ', '',
        '#pragma once',
        '// ^ !something.else'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.matcher instanceof Not).toBeTruthy();
      expect(assertion.matcher.scopes).toEqual([
        'something.else',
      ]);
    });
  });
});
