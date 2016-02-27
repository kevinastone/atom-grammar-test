'use babel';

import { readFileSync } from 'fs';


class LineIterator {
  constructor(filename) {
    this.filename = filename;
  }

  *[Symbol.iterator]() {
    const data = readFileSync(this.filename, 'utf8');

    for (const line of data.split(/\r\n|\r|\n/g)) {
      yield line;
    }
  }
}

export function* lines(filename) {
  yield* new LineIterator(filename);
}
