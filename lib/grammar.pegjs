/**
 * Grammar Assertion Parser
 * Returns a tuple of positions, and scopes
 * "<-" returns a 0 position
 * 
 * Example: parse.parse('^ ^ ^ first second.third') ->
 * [[1, 3, 5], ['first', 'second.third']]
 */

{ 
  /**
   * Column counter
   * @type {Number}
   */
  var col = 0;
}

assertion = positions scopes

_ = [ \t]*
spaces = spaces:" "* { return spaces.join(''); }
startTokenPosition = "<-" { return [col]; }
caratPosition = spaces:spaces carat:"^" { col = col + spaces.length + carat.length; return col; }

positions =
  startTokenPosition / caratPosition+


identifier = firstChar:[a-zA-Z_] suffix:[a-zA-Z0-9_-]* { return firstChar + suffix.join(''); }

scopeSuffix = 
  dot:"." id:identifier { return dot + id; }
scope =
  prefix:identifier suffix:scopeSuffix* { return prefix + suffix.join(''); }

scopeWithSpace =
  _ scope:scope { return scope; }

scopes =
  scopeWithSpace+
