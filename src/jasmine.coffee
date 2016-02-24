AtomGrammarTest = require './parser'

customMatchers =
  toHaveValidGrammar: ->
    @message = -> @actual.message() unless @actual.result
    return @actual.result


module.exports = (filename) ->

  @beforeEach ->
    @.addMatchers customMatchers

  grammarTest = new AtomGrammarTest(filename)
  it "should parse #{filename}", ->

    grammarTest.test().forEach (result) ->
      expect(result).toHaveValidGrammar()
