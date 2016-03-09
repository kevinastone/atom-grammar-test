'use babel';
/* @flow */

import { matchScopes } from './scope';
import { zipLongest } from './utils';


/* ::
import type { TModifier as Modifier } from './grammar';
*/


export class Matcher {
  /* ::
  scopes: Array<string>;
  */
  constructor(...scopes /* : Array<string> */) {
    this.scopes = scopes;
  }

  matches(..._scopes /* : Array<string> */) /* : boolean */ {
    throw Error('Not Implemented');
  }

  message() /* : string */ {
    throw Error('Not Implemented');
  }
}


export class Contains extends Matcher {
  matches(...scopes /* : Array<string> */) /* : boolean */ {
    return this.scopes.every((expected) =>
      scopes.some((actual) =>
        matchScopes(actual, expected)
      )
    );
  }

  message() /* : string */ {
    return `to find ${this.scopes.join(', ')}`;
  }
}


export class Only extends Matcher {
  matches(...scopes /* : Array<string> */) /* : boolean */ {
    const source = Array.from(this.scopes).sort();
    const target = Array.from(scopes).sort();

    return zipLongest(source, target).every((vals) => matchScopes(...vals));
  }

  message() /* : string */ {
    return `to find only ${this.scopes.join(', ')}`;
  }
}


export class Not extends Contains {
  matches(...scopes /* : Array<string> */) /* : boolean */ {
    return !super.matches(...scopes);
  }

  message() /* : string */ {
    return `to not find ${this.scopes.join(', ')}`;
  }
}


export function matcherBuilder(modifier /* : Modifier */, ...scopes /* : Array<string> */) /* : Matcher */ {
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
