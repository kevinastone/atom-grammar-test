'use babel';

// No Underscore :(
export function zip(...arrays) {
  const shortest = arrays.length <= 0 ? [] : arrays.reduce((a, b) => a.length < b.length ? a : b);
  return shortest.map((_, i) => arrays.map(a => a[i]));
}


export function* takeWhile(iterator, callback) {
  for (const item of iterator) {
    yield item;
    if (!callback(item)) {
      return;
    }
  }
}
