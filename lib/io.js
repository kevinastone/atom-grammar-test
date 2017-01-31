'use babel';

/* @flow */

import { readFileSync } from 'fs';

/* ::
export interface LineIterator extends Iterator<string> {
  filename: string;
}
*/

function* _lines(filename /* : string */) /* : Iterator<string> */ {
  const data = readFileSync(filename, 'utf8');

  for (const line of data.split(/\r\n|\r|\n/g)) {
    yield line;
  }
}

// Neeed to fake Flow out
function _annotateIterator(iterator /* : any */, filename /* : string */) /* : LineIterator */ {
  return Object.assign(iterator, { filename });
}

export function lines(filename /* : string */) /* : LineIterator */ {
  const iterator = _lines(filename);
  return _annotateIterator(iterator, filename);
}
