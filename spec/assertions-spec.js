'use babel';

import { AssertionParser } from '../lib/assertions';
import { parsedLineFixture } from './utils';


function parserFixture(...lines) {
  const iterator = parsedLineFixture('blah.txt', ...lines);
  iterator.header = {
    openToken: '// ',
    closeToken: '',
    source: 'source.c',
  };
  return new AssertionParser(iterator);
}


describe('Assertions', () => {
  describe('AssertionParser', () => {
    it('should only return source lines', () => {
      const parser = parserFixture(
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma',
        '// ^ keyword.control.directive.pragma'
      );
      expect(
        Array.from(parser).map((item) => item.line)
      ).toEqual([
        '#pragma once',
      ]);
    });

    it('should map assertions onto the source line', () => {
      const parser = parserFixture(
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma',
        '// ^ keyword.control.directive.pragma'
      );

      const assertions = Array.from(parser)[0].assertions;
      expect(assertions.length).toEqual(3);
    });

    it('should parse <- assertions', () => {
      const parser = parserFixture(
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.scopes).toEqual([
        'punctuation.definition.directive',
        'meta.preprocessor.c',
      ]);
      expect(assertion.column).toEqual(1);
    });

    it('should parse <- assertions with leading whitespace', () => {
      const parser = parserFixture(
        '#pragma once',
        ' // <- keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(2);
    });

    it('should parse ^ assertions', () => {
      const parser = parserFixture(
        '#pragma once',
        '// ^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(4);
    });

    it('should parse ^ assertions with leading whitespace', () => {
      const parser = parserFixture(
        '#pragma once',
        '  // ^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(6);
    });

    it('should parse ^ assertions with prefixed whitespace whitespace', () => {
      const parser = parserFixture(
        '#pragma once',
        '//    ^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(7);
    });

    it('should parse ^^+ assertions', () => {
      const parser = parserFixture(
        '#pragma once',
        '// ^^^^ keyword.control.directive.pragma'
      );

      const assertion = Array.from(parser)[0].assertions[0];
      expect(assertion.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(assertion.column).toEqual(4);
    });
  });
});
