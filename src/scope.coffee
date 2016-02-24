{zip} = require './utils'


matchScopes = (actual, expected) ->
  actualArray = actual.split('.')
  expectedArray = expected.split('.')
  zip(actualArray, expectedArray).every ([a, e]) ->
    a is e


module.exports =
  matchScopes: matchScopes
