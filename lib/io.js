'use babel';

import { readFileSync } from 'fs';


function* _lines(filename) {
  const data = readFileSync(filename, 'utf8');

  for (const line of data.split(/\r\n|\r|\n/g)) {
    yield line;
  }
}


export function lines(filename) {
  const iterator = _lines(filename);
  iterator.filename = filename;
  return iterator;
}
