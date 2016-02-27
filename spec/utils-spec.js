'use babel';

import { zip, takeWhile } from '../lib/utils';


describe('Utils', () => {
  describe('zip', () => {
    it('should zip arrays', () => {
      expect(zip([1, 2], [3, 4])).toEqual([[1, 3], [2, 4]]);
    });

    it('should zip the shortest arrays', () => {
      expect(zip([1, 2], [3])).toEqual([[1, 3]]);
    });

    it('should zip no arrays', () => {
      expect(zip()).toEqual([]);
    });
  });

  describe('takeWhile', () => {
    it('should return empty on empty input', () => {
      expect(Array.from(takeWhile([], (item) => !item))).toEqual([]);
    });
    it('should return all items if the callback is never truthy', () => {
      expect(Array.from(takeWhile([0, 0, 0], (item) => !item))).toEqual([0, 0, 0]);
    });
    it('should return include the first truthy callback', () => {
      expect(Array.from(takeWhile([0, 1, 2], (item) => !item))).toEqual([0, 1]);
    });
    it('should return work with iterators when called consecutively', () => {
      const it = [0, 1, 0, 2, 0][Symbol.iterator]();
      expect(Array.from(takeWhile(it, (item) => !item))).toEqual([0, 1]);
      expect(Array.from(takeWhile(it, (item) => !item))).toEqual([0, 2]);
    });
    it('should return empty if the iterator is exhausted', () => {
      const it = [0, 1][Symbol.iterator]();
      expect(Array.from(takeWhile(it, (item) => !item))).toEqual([0, 1]);
      expect(Array.from(takeWhile(it, (item) => !item))).toEqual([]);
    });
  });
});
