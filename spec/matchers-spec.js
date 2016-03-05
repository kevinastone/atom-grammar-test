'use babel';

import { Contains, Only } from '../lib/matchers';


describe('Matchers', () => {
  describe('Contains', () => {
    it('should match equal single value', () => {
      expect(new Contains('test').matches('test')).toBeTruthy();
    });

    it('should match equal multiple values', () => {
      expect(new Contains('test', 'test2').matches('test', 'test2')).toBeTruthy();
    });

    it('should match equal multiple values out of order', () => {
      expect(new Contains('test', 'test2').matches('test2', 'test')).toBeTruthy();
    });

    it('should match a single value against multiple values', () => {
      expect(new Contains('test').matches('test', 'test2')).toBeTruthy();
    });

    it('should not match a different value against a single value', () => {
      expect(new Contains('blah').matches('test')).toBeFalsy();
    });

    it('should not match a different value against multiple values', () => {
      expect(new Contains('blah').matches('test', 'test2')).toBeFalsy();
    });
  });

  describe('Only', () => {
    it('should match equal single value', () => {
      expect(new Only('test').matches('test')).toBeTruthy();
    });

    it('should match equal multiple values', () => {
      expect(new Only('test', 'test2').matches('test', 'test2')).toBeTruthy();
    });

    it('should match equal multiple values out of order', () => {
      expect(new Only('test', 'test2').matches('test2', 'test')).toBeTruthy();
    });

    it('should not match a single value against multiple values', () => {
      expect(new Only('test').matches('test', 'test2')).toBeFalsy();
    });
  });
});
