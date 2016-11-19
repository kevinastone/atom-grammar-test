'use babel';

// No Underscore :(
export function zip(...arrays) {
  const shortest = arrays.length <= 0 ? [] : arrays.reduce((a, b) => (a.length < b.length ? a : b));
  return shortest.map((_, i) => arrays.map(a => a[i]));
}


export function zipLongest(...arrays) {
  const longest = arrays.length <= 0 ? [] : arrays.reduce((a, b) => (a.length > b.length ? a : b));
  return longest.map((_, i) => arrays.map(a => a[i]));
}


export function* takeWhile(iterator, callback) {
  for (const item of iterator) {
    yield item;
    if (!callback(item)) {
      return;
    }
  }
}

export class PreventReturn {
  constructor(iterator) {
    this.iterator = iterator;
  }
  /** Must also be iterable, so that for-of works */
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.iterator.next();
  }
  return(value = undefined) {
    return { done: false, value };
  }
}
