# No Underscore :(
zip = (arrays...) ->
  shortest = if arrays.length <= 0 then [] else arrays.reduce (a, b) ->
    if a.length < b.length then a else b

  shortest.map (_, i) ->
    arrays.map (a) ->
      a[i]


module.exports =
  zip: zip
