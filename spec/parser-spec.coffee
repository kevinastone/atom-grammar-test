{parse} = require '../lib/parser'
{lineFixture} = require './utils'


describe 'AtomGrammarTest Parser', ->

  describe 'Header', ->

    beforeEach ->
      @filename = 'blah.txt'
      @iterator = lineFixture(@filename,
        '// SYNTAX TEST "source.c"',
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma',
      )
      @parser = parse(@iterator)

    beforeEach ->
      @htmlFilename = 'something.html'
      @htmlIterator = lineFixture(@htmlFilename,
        '<!-- SYNTAX TEST "text.html.basic" -->',
        '<TagName>',
        '<!-- <- punctuation.definition.tag.begin.html -->',
        '<!-- ^ entity.name.tag.other.html -->',
      )
      @htmlParser = parse(@htmlIterator)

    it 'should remember the filename', ->
      expect(@parser.filename).toBe @filename

    it 'should parse the comment token', ->
      expect(@parser.header.openToken).toBe '// '
      expect(@htmlParser.header.openToken).toBe '<!-- '
      expect(@htmlParser.header.closeToken).toBe ' -->'

    it 'should parse the source declaration', ->
      expect(@parser.header.scope).toBe 'source.c'
      expect(@htmlParser.header.scope).toBe 'text.html.basic'

    it 'should iterate the input lines', ->
      expect(Array.from(@parser).map((line) -> line.line)).toEqual [
        '#pragma once',
        '// <- punctuation.definition.directive meta.preprocessor.c',
        ' // <- keyword.control.directive.pragma',
      ]
      expect(Array.from(@htmlParser).map((line) -> line.line)).toEqual [
        '<TagName>',
        '<!-- <- punctuation.definition.tag.begin.html -->',
        '<!-- ^ entity.name.tag.other.html -->',
      ]
