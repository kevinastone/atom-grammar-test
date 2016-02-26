{AssertionParser, AssertionCheck} = require '../lib/assertions'
{parsedLineFixture} = require './utils'


describe 'Assertions', ->

  describe 'AssertionParser', ->

    beforeEach ->
      @filename = 'blah.txt'
      @iterator = parsedLineFixture(@filename,
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        '// ^ keyword.control.directive.pragma',
      )
      @iterator.header =
        openToken: '// '
        closeToken: ''
        source: 'source.c'
      @parser = new AssertionParser(@iterator)

    it 'should only return source lines', ->
      expect(
        Array.from(@parser).map (item) -> item.line
      ).toEqual [
        '#pragma once',
      ]

    it 'should map assertions onto the source line', ->
      assertions = Array.from(@parser)[0].assertions
      expect(assertions.length).toEqual 2

      [meta, pragma] = assertions

      expect(meta.scopes).toEqual [
        'punctuation.definition.directive',
        'meta.preprocessor.c',
      ]
      expect(meta.column).toEqual 1

      expect(pragma.scopes).toEqual [
        'keyword.control.directive.pragma',
      ]
      expect(pragma.column).toEqual 4
