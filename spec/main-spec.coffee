grammarTest = require '../lib/main'
{fixtureFilename} = require './utils'


describe 'Atom Grammar Test Jasmine', ->

  describe 'C Syntax Assertions', ->

    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage 'language-c',

    grammarTest fixtureFilename('C/syntax_test_c_example.c')


  describe 'HTML Syntax Assertions', ->

    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage 'language-html'

    grammarTest fixtureFilename('HTML/syntax_test_html_example.html')
