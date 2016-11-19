'use babel';

import { zip } from './utils';


const SCOPE_REGEX = /\S+/gi;


export function matchScopes(actual = '', expected = '') {
  const actualArray = actual.split('.');
  const expectedArray = expected.split('.');

  return zip(actualArray, expectedArray).every(vals => vals[0] === vals[1]);
}


export function parseScopes(scopes) {
  const scopeList = [];
  for (;;) {
    const scopeMatch = SCOPE_REGEX.exec(scopes);
    if (!scopeMatch) {
      break;
    }
    scopeList.push(scopeMatch[0]);
  }
  return scopeList;
}


export function rulesToScopes(rules) {
  return rules.map(r => r.scopeName).filter(r => !!r);
}
