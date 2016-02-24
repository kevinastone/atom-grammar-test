{matchScopes} = require './scope'


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


module.exports =
  AssertionBuilder: AssertionBuilder
