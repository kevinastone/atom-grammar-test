'use babel';

import { matchScopes } from './scope';
import { zipLongest } from './utils';


class Matcher {
  constructor(...scopes) {
    this.scopes = scopes;
  }

  matches(..._scopes) {
    throw Error('Not Implemented');
  }

  message() {
    throw Error('Not Implemented');
  }
}


export class Contains extends Matcher {
  matches(...scopes) {
    return this.scopes.every(expected =>
      scopes.some(actual => matchScopes(actual, expected))
    );
  }

  message() {
    return `to find ${this.scopes.join(', ')}`;
  }
}


export class Only extends Matcher {
  matches(...scopes) {
    const source = Array.from(this.scopes).sort();
    const target = Array.from(scopes).sort();

    return zipLongest(source, target).every(vals => matchScopes(...vals));
  }

  message() {
    return `to find only ${this.scopes.join(', ')}`;
  }
}


export class Not extends Contains {
  matches(...scopes) {
    return !super.matches(...scopes);
  }

  message() {
    return `to not find ${this.scopes.join(', ')}`;
  }
}


export function matcherBuilder(modifier, ...scopes) {
  switch (modifier) {
    case '@':
      return new Contains(...scopes);
    case '=':
      return new Only(...scopes);
    case '!':
      return new Not(...scopes);
    default:
      throw Error(`Unknown modifier: ${modifier}`);
  }
}
