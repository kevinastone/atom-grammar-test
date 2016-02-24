fs = require 'fs'
{AssertionBuilder} = require './assertions'


HEADER_REGEX = /^(.+?)SYNTAX TEST (['"])([^\2]+)\2(.*)$/i


class AtomGrammarTestParser
  constructor: (@filename) ->
    data = fs.readFileSync(@filename, 'utf8')
    lines = data.split /\r\n|\r|\n/g
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
