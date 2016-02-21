jasmineBuilder = require '../lib/jasmine'
{fixtureFilename} = require './utils'


describe 'Atom Grammar Test Jasmine', ->

  describe 'C Syntax Assertions', ->

    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage 'language-c',

    jasmineBuilder fixtureFilename('C/syntax_test_c_example.c')


  describe 'HTML Syntax Assertions', ->

    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage 'language-html'

    jasmineBuilder fixtureFilename('HTML/syntax_test_html_example.html')
