AtomGrammarTest = require '../src/parser'
{fixtureFilename} = require './utils'


describe 'AtomGrammarTest Parser', ->

  beforeEach ->
    @grammarTest = new AtomGrammarTest(fixtureFilename('C/syntax_test_c_example.c'))
    @htmlGrammarTest = new AtomGrammarTest(fixtureFilename('HTML/syntax_test_html_example.html'))

  it 'should parse the comment token', ->
    expect(@grammarTest.openToken).toBe '// '
    expect(@htmlGrammarTest.openToken).toBe '<!-- '
    expect(@htmlGrammarTest.closeToken).toBe ' -->'

  it 'should parse the source declaration', ->
    expect(@grammarTest.scope).toBe 'source.c'
    expect(new AtomGrammarTest(fixtureFilename('HTML/syntax_test_html_example.html')).scope).toBe 'text.html.basic'

  it 'should parse CRLF encoded files', ->
    parseCRLF = ->
      new AtomGrammarTest(fixtureFilename('syntax_test_crlf.txt'))
    expect(parseCRLF).not.toThrow()

  describe 'Parsing Assertions', ->

    it 'should strip the grammar assertions', ->
      expect(@grammarTest.lines.length).toBe 14

    it 'should parse the first rule at L2C1', ->
      expect(@grammarTest.builder.assertions[0].line).toBe 2
      expect(@grammarTest.builder.assertions[0].column).toBe 1

    it 'should parse the second rule at L2C2', ->
      expect(@grammarTest.builder.assertions[1].line).toBe 2
      expect(@grammarTest.builder.assertions[1].column).toBe 2

    it 'should parse the third rule at L6C4', ->
      expect(@grammarTest.builder.assertions[2].line).toBe 6
      expect(@grammarTest.builder.assertions[2].column).toBe 4

    it 'should parse the seventh rule at L10C8', ->
      expect(@grammarTest.builder.assertions[6].line).toBe 10
      expect(@grammarTest.builder.assertions[6].column).toBe 8

    it 'should parse all the assertions', ->
      expect(@grammarTest.builder.assertions.length).toBe 16

  describe 'Testing Assertions', ->

    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage 'language-c',

    it 'should return results that match the number of assertions', ->
      expect(@grammarTest.test().length).toEqual @grammarTest.builder.assertions.length
