'use babel';

import { AssertionParser } from '../lib/assertions';
import { parsedLineFixture } from './utils';


describe('Assertions', () => {
  describe('AssertionParser', () => {
    beforeEach(() => {
      this.filename = 'blah.txt';
      this.iterator = parsedLineFixture(this.filename,
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        '// ^ keyword.control.directive.pragma'
      );
      this.iterator.header = {
        openToken: '// ',
        closeToken: '',
        source: 'source.c',
      };
      this.parser = new AssertionParser(this.iterator);
    });

    it('should only return source lines', () => {
      expect(
        Array.from(this.parser).map((item) => item.line)
      ).toEqual([
        '#pragma once',
      ]);
    });

    it('should map assertions onto the source line', () => {
      const assertions = Array.from(this.parser)[0].assertions;
      expect(assertions.length).toEqual(2);

      const [meta, pragma] = assertions;

      expect(meta.scopes).toEqual([
        'punctuation.definition.directive',
        'meta.preprocessor.c',
      ]);
      expect(meta.column).toEqual(1);

      expect(pragma.scopes).toEqual([
        'keyword.control.directive.pragma',
      ]);
      expect(pragma.column).toEqual(4);
    });
  });
});
