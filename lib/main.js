'use babel';
/* eslint-disable prefer-arrow-callback */
/* eslint-env jasmine */
/* global atom */

import { lines } from './io';
import { parse } from './parser';
import { AssertionParser } from './assertions';


const customMatchers = {

  toHaveValidGrammar(assertion) {
    let columnNumber = 1;

    const token = this.actual.filter((tok) => {
      const startColumnNumber = columnNumber;
      const endColumnNumber = columnNumber + tok.value.length;
      columnNumber = endColumnNumber;

      return startColumnNumber <= assertion.column && assertion.column < endColumnNumber;
    }).shift();

    if (!token) {
      this.message = function() {
        return `Expected to find ${assertion.message()}, instead found no token`;
      };

      return false;
    }

    const missing = assertion.findMissing(...token.scopes);

    if (missing.length) {
      this.message = function() {
        return `Expected to find ${assertion.message()}, instead found ${token.scopes.join(', ')}`;
      };
      return false;
    }

    return true;
  },
};

export default function(filename) {
  describe(`AtomGrammarTest(${filename})`, function() {
    beforeEach(function() {
      this.addMatchers(customMatchers);
    });

    const parser = parse(lines(filename));
    const grammarTest = new AssertionParser(parser);

    // Split up the lines into ones with tests
    it(`should parse ${filename}`, function() {
      let oldRuleStack = null;
      const grammar = atom.grammars.grammarForScopeName(grammarTest.header.scope);

      for (const line of grammarTest) {
        const { tokens, ruleStack } = grammar.tokenizeLine(line.line, oldRuleStack, oldRuleStack === null);

        for (const assertion of line.assertions) {
          expect(tokens).toHaveValidGrammar(assertion);
        }

        oldRuleStack = ruleStack;
      }
    });
  });
}
