# Changelog

## 0.6.3 - 2016-10-14

- Fixed iterator issue in Atom 1.12+ due to an ES6 iterator closing issue.

## 0.6.2 - 2016-03-29

- Reduced memory by not reloading grammar on every test spec

## 0.6.1 - 2016-03-27

- Separate whitespace from comment open and close tokens (`//^ something`)

## 0.6.0 - 2016-03-09

- Added negation modifier
  - !(scope1 scope2)
  - not:scope1
  - !scope1
- Switched from PEGjs to Chevrotain parser

## 0.5.1 - 2016-03-05

- Fixed parsing bug for `only:` modifier

## 0.5.0 - 2016-03-05

- Added start-of-line (<<) and end-of-line (>>) position operators
- Added scope matching modifier and grouping (`only:` or `=`)
  - =(scope1 scope2)
  - only:scope1
  - =scope1

## 0.4.0 - 2016-03-03

- Added PEGjs based parser
- Support multiple carats on a single line

## 0.3.0 - 2016-02-27

- Rewritten in ES6
- Updated to Generate an it() test per line with assertions

## 0.2.0 - 2016-02-24

- Transpile coffeescript to javascript
- Wrap each grammar test file in a describe block

## 0.1.2 - 2016-02-22

- Supports CRLF (and CR) line endings in syntax test files

## 0.1.1 - 2016-02-21

- Improved Expectation Failure Message
  - Shows actual scope on target line/column on expectation failure

## 0.1.0 - 2016-02-20

- First Release
