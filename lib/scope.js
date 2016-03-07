'use babel';
/* @flow */

import { zip } from './utils';


export function matchScopes(actual /* : string */ = '', expected /* : string */ = '') /* : boolean */ {
  const actualArray = actual.split('.');
  const expectedArray = expected.split('.');

  return zip(actualArray, expectedArray).every(vals => vals[0] === vals[1]);
}

/* ::
export class Rule {
  scopeName: ?string;
}
*/

export function rulesToScopes(rules /* : Array<Rule> */) /* : Array<string> */ {
  return rules.reduce((arr, r) => {
    if (r.scopeName) {
      arr.push(r.scopeName);
    }
    return arr;
  }, []);
}
