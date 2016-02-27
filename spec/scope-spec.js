'use babel';

import { matchScopes } from '../lib/scope';


describe('Matching Scopes', () => {
  it('should match exact matches', () => {
    expect(matchScopes('a.b.c', 'a.b.c')).toBeTruthy();
  });

  it('should match prefix matches', () => {
    expect(matchScopes('a.b.c', 'a.b')).toBeTruthy();
    expect(matchScopes('a.b.c', 'a')).toBeTruthy();
  });

  it('should not match empty matches', () => {
    expect(matchScopes('a.b.c', '')).toBeFalsy();
  });
});
