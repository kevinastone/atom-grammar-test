'use babel';

/* eslint-env atomtest */
/* global atom */

import grammarTest from '../lib/main';
import { fixtureFilename } from './utils';


describe('Atom Grammar Test Jasmine', () => {
  describe('C Syntax Assertions', () => {
    beforeEach(() => waitsForPromise(() => atom.packages.activatePackage('language-c')));
    grammarTest(fixtureFilename('C/syntax_test_c_example.c'));
  });
  describe('HTML Syntax Assertions', () => {
    beforeEach(() => waitsForPromise(() => atom.packages.activatePackage('language-html')));
    grammarTest(fixtureFilename('HTML/syntax_test_html_example.html'));
    grammarTest(fixtureFilename('HTML/syntax_test_html_inline.html'));
  });
});
