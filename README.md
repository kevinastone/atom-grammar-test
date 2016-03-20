# Atom Grammar Test

[![npm version](https://badge.fury.io/js/atom-grammar-test.svg)](https://badge.fury.io/js/atom-grammar-test)
[![Build Status](https://travis-ci.org/kevinastone/atom-grammar-test.svg?branch=master)](https://travis-ci.org/kevinastone/atom-grammar-test)

Atom Grammar Test is a testing framework for Atom Grammar definitions
inspired by the [Syntax Testing format for Sublime Text 3][sublime-testing].
It allows you to define grammar fixtures for testing your grammar rules.
Because the fixtures match the source code format, they can be both
programmatically tested as well as visually inspected for easily development.

[View the grammar][grammar]

Here's an adaption of the example provided in the Sublime docs where you
define your tokenization assertions in-line as comments.  Note how it visually
annotates how the grammar should be parsed.

```c
// SYNTAX TEST "source.c"
#pragma once
// <- punctuation.definition.directive meta.preprocessor.c
 // <- keyword.control.directive.pragma

// foo
// ^ source.c comment.line
// <- punctuation.definition.comment

/* foo */
// ^ source.c comment.block
// <- punctuation.definition.comment.begin
//     ^ punctuation.definition.comment.end

#include "stdio.h"
// <- keyword.control.directive.include
//       ^ meta string punctuation.definition.string.begin
//               ^ meta string punctuation.definition.string.end
int square(int x)
// <- storage.type
//  ^ meta.function entity.name.function
//         ^ storage.type
{
    return x * x;
//  ^^^^^^ keyword.control
}

"Hello, World! // not a comment";
// ^ string.quoted.double
//                  ^ string.quoted.double

// EOF Check (root scope)
// >> =source.c
```

Once you've defined your grammar test, you can simply plug into the Jasmine
1.3 provided by Atom:

```coffeescript
grammarTest = require 'atom-grammar-test'

describe 'My Grammar', ->

  beforeEach ->
    # Ensure you're language package is loaded
    waitsForPromise ->
      atom.packages.activatePackage 'language-<your-grammar>',

  grammarTest('<path to your grammar test file>')
```

## Installation Instructions

You can install `atom-grammar-test` via [npm][npm] and should add it to your
`devDependencies` of your atom package's package.json:

```
npm install atom-grammar-test --save-dev
```

## Projects Using Atom Grammar Test

- [language-babel](https://atom.io/packages/language-babel)
- [language-html](https://atom.io/packages/language-html)
- [nuclide/language-hack](https://atom.io/packages/nuclide)
- [language-1c-bsl](https://atom.io/packages/language-1c-bsl)

[sublime-testing]: https://www.sublimetext.com/docs/3/syntax.html#Testing
[grammar]: http://htmlpreview.github.io/?https://raw.githubusercontent.com/kevinastone/atom-grammar-test/master/docs/grammar.html
[npm]: https://www.npmjs.com
