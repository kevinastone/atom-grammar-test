'use babel';
/* eslint-env jasmine */
/* global atom */

import { AssertionParser } from './assertions';
import { lines } from './io';
import { parse } from './parser';
import { takeWhile } from './utils';


const customMatchers = {

  toHaveValidGrammar(assertion) {
    const token = assertion.findToken(...this.actual);

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
  describe(`AtomGrammarTest(${filename})`, () => {
    const parser = parse(lines(filename));
    const grammarTest = new AssertionParser(parser);
    let lineAccumulator = [];

    beforeEach(function() { this.addMatchers(customMatchers); }); // eslint-disable-line prefer-arrow-callback
    beforeEach(() => {
      this.grammar = atom.grammars.grammarForScopeName(grammarTest.header.scope);
    });

    function addAssertions(grammarLines) {
      let lastTokens = [];
      const [lastLine] = grammarLines.slice(-1);
      if (!lastLine.assertions.length) {
        return;
      }

      it(`should parse line ${lastLine.lineNumber}: ${lastLine.line}`, () => {
        let oldRuleStack = null;

        for (const line of grammarLines) {
          const { tokens, ruleStack } = this.grammar.tokenizeLine(line.line, oldRuleStack, oldRuleStack === null);

          lastTokens = tokens;
          oldRuleStack = ruleStack;
        }

        for (const assertion of lastLine.assertions) {
          expect(lastTokens).toHaveValidGrammar(assertion);
        }
      });
    }

    const grammarIterator = grammarTest[Symbol.iterator]();
    for (;;) {
      const grammarLines = Array.from(takeWhile(grammarIterator, (line) => line.assertions.length <= 0));
      if (grammarLines.length <= 0) {
        break;
      }

      lineAccumulator = lineAccumulator.concat(grammarLines);
      addAssertions(lineAccumulator);
    }
  });
}
