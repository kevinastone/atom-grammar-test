fs = require 'fs'
{matchScopes} = require './scope'


HEADER_REGEX = /^(.+?)SYNTAX TEST (['"])([^\2]+)\2(.*)$/i
SCOPE_REGEX = /\S+/gi


class Assertion
  constructor: (@line, @column, @scopes...) ->
  findMissing: (scopes...) ->
    @scopes.filter (expected) ->
      not scopes.some (actual) ->
        matchScopes actual, expected

  message: ->
    "#{@scopes.join(', ')} at #{@line}:#{@assertion.column}"


class AssertionCheck
  constructor: (@assertion, @scopes...) ->
    @missing = @assertion.findMissing(scopes...)
    @result = not @missing.length

  message: ->
    unless @result
      "Expected to find #{@missing.join(', ')} at #{@assertion.line}:#{@assertion.column}, instead found #{@scopes.join(', ')}"


class AssertionBuilder
  constructor: (@openToken, @closeToken) ->
    @regex = new RegExp("^(\\s*)#{openToken}(<-|(?:\\s*(\\^+)))(.+)#{closeToken}$")
    @assertions = []
    @assertionsAtLine = {}

  process: (lines) ->
    output = []
    absoluteLineNumber = 1
    sourceLineNumber = undefined
    finalLineNumber = 0
    lines.forEach (line) =>
      absoluteLineNumber += 1
      match = @regex.exec line
      if match
        [_ignore, leadingWhitespace, operator, carets, scopes] = match
        scopes = while match = SCOPE_REGEX.exec(scopes)
          match[0]

        throw Error("Can't have assertion before any syntax") unless sourceLineNumber
        columnNumber = 1 + leadingWhitespace.length
        unless operator is '<-'
          columnNumber += @openToken.length + operator.length - carets.length
        assertion = new Assertion(sourceLineNumber, columnNumber, scopes...)
        @assertions.push assertion
        @assertionsAtLine[finalLineNumber].push assertion
      else
        sourceLineNumber = absoluteLineNumber
        finalLineNumber += 1
        @assertionsAtLine[finalLineNumber] ||= []
        output.push(line)
    return output

  testAssertions: (line, startColumn, endColumn, scopes...) ->
    @assertionsAtLine[line].filter((assertion) ->
      startColumn <= assertion.column < endColumn
    ).map((assertion) ->
      return new AssertionCheck(assertion, scopes...)
    )


class AtomGrammarTestParser
  constructor: (@filename) ->
    data = fs.readFileSync(@filename, 'utf8')
    lines = data.split '\n'
    throw Error("#{@filename} was empty") unless lines.length > 0
    [header, lines...] = lines
    config = HEADER_REGEX.exec header
    throw Error("#{@filename} is not a Syntax Test: #{header}") unless config
    [_ignore, @openToken, _ignore, @scope, @closeToken] = config

    @builder = new AssertionBuilder(@openToken, @closeToken)
    @lines = @builder.process(lines)

  test: ->
    results = []
    grammar = atom.grammars.grammarForScopeName @scope
    throw Error("Couldn't find grammar for #{@scope}") unless grammar

    tokenizedLines = grammar.tokenizeLines(@lines.join '\n')
    tokenizedLines.forEach (line, lineNumber) =>
      columnNumber = 1
      line.forEach (token) =>
        endColumnNumber = columnNumber + token.value.length
        outcomes = @builder.testAssertions(lineNumber + 1, columnNumber, endColumnNumber, token.scopes...)
        results.push outcomes...
        columnNumber = endColumnNumber

    return results


module.exports = AtomGrammarTestParser
