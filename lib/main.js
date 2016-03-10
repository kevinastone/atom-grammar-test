'use babel';
/* @flow */
/* eslint-env jasmine */
/* global atom */
/* eslint-disable prefer-arrow-callback */

import { AssertionParser } from './assertions';
import { lines } from './io';
import { escapeSpecName } from './jasmine';
import { parse } from './parser';
import { rulesToScopes } from './scope';
import { segmentTokens } from './tokens';
import { takeWhile } from './utils';

/* ::
import type { Rule } from './scope';
import { Assertion } from './assertions';
*/

const customMatchers /* : {[key: string]: (...args: Array<any>) => boolean} */ = {

  toHaveValidGrammar(assertion /* : Assertion */) /* : boolean */ {
    const token = assertion.findToken(...this.actual);

    if (!token) {
      this.message = () => `Expected ${assertion.message()}, instead found no token`;
      return false;
    }

    if (!assertion.matcher.matches(...token.scopes)) {
      this.message = () => `Expected ${assertion.message()}, instead found ${token.scopes.join(', ')}`;
      return false;
    }

    return true;
  },
};


export default function(filename /* : string */) /* : void */ {
  describe(`AtomGrammarTest(${filename})`, function() {
    const parser = parse(lines(filename));
    const grammarTest = new AssertionParser(parser);
    let lineAccumulator = [];

    beforeEach(function() { this.addMatchers(customMatchers); });
    beforeEach(function() {
      this.grammar = atom.grammars.grammarForScopeName(grammarTest.header.scope);
    });

    function addAssertions(grammarLines, rootScope) {
      let lastTokens = [];
      const [lastLine] = grammarLines.slice(-1);
      if (!lastLine.assertions.length) {
        return;
      }

      const sanitizedLine = escapeSpecName(lastLine.line);
      it(`should parse line ${lastLine.lineNumber}: ${sanitizedLine}`, function() {
        let startRuleStack = null;
        let endRuleStack = null;
        const rootRuleStack = [{ scopeName: rootScope }];

        for (const line of grammarLines) {
          startRuleStack = endRuleStack;
          const { tokens, ruleStack } = this.grammar.tokenizeLine(line.line, endRuleStack, endRuleStack === null);

          lastTokens = tokens;
          endRuleStack = ruleStack;
        }

        const segmentedTokens = segmentTokens(
          lastTokens,
          rulesToScopes(startRuleStack || rootRuleStack),  // Starting scopes
          rulesToScopes(endRuleStack || [])  // Ending scopes
        );
        for (const assertion of lastLine.assertions) {
          // $FlowIgnore: Can't type this dynamic call to the JasmineMatcher
          expect(segmentedTokens).toHaveValidGrammar(assertion);
        }
      });
    }

    // $FlowIssue: Flow can't handle symbols/computed properties
    const grammarIterator = grammarTest[Symbol.iterator]();
    for (;;) {
      const grammarLines = Array.from(takeWhile(grammarIterator, (line) => line.assertions.length <= 0));
      if (grammarLines.length <= 0) {
        break;
      }

      lineAccumulator = lineAccumulator.concat(grammarLines);
      addAssertions(lineAccumulator, grammarTest.header.scope);
    }
  });
}
