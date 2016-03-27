'use babel';

import { parse } from '../lib/parser';
import { lineFixture } from './utils';


describe('AtomGrammarTest Parser', () => {
  describe('Header', () => {
    beforeEach(() => {
      this.filename = 'blah.txt';
      this.iterator = lineFixture(this.filename,
        '// SYNTAX TEST "source.c"',
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma'
      );
      this.parser = parse(this.iterator);
    });

    beforeEach(() => {
      this.htmlFilename = 'something.html';
      this.htmlIterator = lineFixture(this.htmlFilename,
        '<!-- SYNTAX TEST "text.html.basic" -->',
        '<TagName>',
        '<!-- <- punctuation.definition.tag.begin.html -->',
        '<!-- ^ entity.name.tag.other.html -->'
      );
      this.htmlParser = parse(this.htmlIterator);
    });

    it('should remember the filename', () => {
      expect(this.parser.filename).toBe(this.filename);
    });

    it('should parse the comment token', () => {
      expect(this.parser.header.openToken).toBe('//');
      expect(this.htmlParser.header.openToken).toBe('<!--');
      expect(this.htmlParser.header.closeToken).toBe('-->');
    });

    it('should parse the source declaration', () => {
      expect(this.parser.header.scope).toBe('source.c');
      expect(this.htmlParser.header.scope).toBe('text.html.basic');
    });

    it('should iterate the input lines', () => {
      expect(Array.from(this.parser).map((line) => line.line)).toEqual([
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma',
      ]);
      expect(Array.from(this.htmlParser).map((line) => line.line)).toEqual([
        '<TagName>',
        '<!-- <- punctuation.definition.tag.begin.html -->',
        '<!-- ^ entity.name.tag.other.html -->',
      ]);
    });
  });
});
