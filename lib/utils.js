'use babel';

/* @flow */

// No Underscore :(
export function zip/* :: <T> */(...arrays /* : Array<Array<T>> */) /* : Array<Array<T>> */ {
  const shortest = arrays.length <= 0 ? [] : arrays.reduce((a, b) => (a.length < b.length ? a : b));
  return shortest.map((_, i) => arrays.map(a => a[i]));
}


export function zipLongest/* :: <T> */(...arrays /* : Array<Array<T>> */) /* : Array<Array<T>> */ {
  const longest = arrays.length <= 0 ? [] : arrays.reduce((a, b) => (a.length > b.length ? a : b));
  return longest.map((_, i) => arrays.map(a => a[i]));
}


export function* takeWhile/* :: <T> */(
  iterator /* : Iterable<T> */,
  callback /* : (item: T) => boolean */
) /* : Iterable<T> */ {
  for (const item of iterator) {
    yield item;
    if (!callback(item)) {
      return;
    }
  }
}

export class PreventReturn/* :: <T> implements Iterable<T> */ {
  iterator /* : Iterator<T> */;

  /* ::
  @@iterator(): Iterator<any> {
    return this;
  };
  */

  constructor(iterator/* : Iterator<T> */) {
    this.iterator = iterator;
  }
  /** Must also be iterable, so that for-of works */
  // $FlowIssue
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.iterator.next();
  }

  return(value/* : ?T */ = undefined) {
    return { done: false, value };
  }
}
