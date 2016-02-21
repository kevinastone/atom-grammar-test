path = require 'path'


fixtureFilename = (filename) ->
  path.join(__dirname, 'fixtures', filename)


module.exports =
  fixtureFilename: fixtureFilename
