'use babel';

import { lines } from '../lib/io';
import { fixtureFilename } from './utils';


describe('IO', () => {
  describe('lines', () => {
    it('should parse files into lines', () => {
      const iterator = lines(fixtureFilename('HTML/syntax_test_html_example.html'));
      expect(Array.from(iterator)).toEqual([
        '<!-- SYNTAX TEST "text.html.basic" -->',
        '<TagName>',
        '<!-- <- punctuation.definition.tag.begin.html -->',
        '<!-- ^ entity.name.tag.other.html -->',
        '</TagName>',
        '<!-- ^ entity.name.tag.other.html -->',
        '',
      ]);
    });
    it('should parse CRLF encoded files', () => {
      const iterator = lines(fixtureFilename('syntax_test_crlf.txt'));
      expect(Array.from(iterator)).toEqual([
        '# SYNTAX TEST "text/plain"',
        '',
      ]);
    });
  });
});
