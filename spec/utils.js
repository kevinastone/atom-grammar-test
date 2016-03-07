'use babel';
/* @flow */

import path from 'path';


export function fixtureFilename(filename/* : string */) /* : string */ {
  return path.join('spec', 'fixtures', filename);
}


function* _lines/* :: <T> */(...lines /* : Array<T> */) /* : Iterator<T> */ {
  for (const line of lines) {
    yield line;
  }
}


export function lineFixture/* :: <T> */(filename /* : string */, ...lines /* : Array<T> */) /* : Iterator<T> */ {
  const iterator = _lines(...lines);
  // $FlowFixMe: Flow doesn't support sub-classed generators
  iterator.filename = filename;
  return iterator;
}


export function parsedLineFixture(filename /* : string */, ...lines /* : Array<string> */) /* : Iterator<any> */ {
  const parsedLines = lines.map(
    (line, index) => {  // eslint-disable-line arrow-body-style
      return { line, lineNumber: index + 1 };
    }
  );
  return lineFixture(filename, ...parsedLines);
}
