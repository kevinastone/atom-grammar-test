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
  var col = 1;
}

assertion = positions scopes

_                 = [ \t]*
spaces            = spaces:" "* { return spaces.join(''); }

startLinePosition = "<<" { return [0]; }
endLinePosition   = ">>" { return [-1]; }
openTokenPosition = "<-" { return [col]; }
caratPosition     = spaces:spaces carat:"^" { col = col + spaces.length + carat.length; return col; }

positions         =
  startLinePosition / endLinePosition / openTokenPosition / caratPosition+

identifier        =
  firstChar:[a-zA-Z_] suffix:[a-zA-Z0-9_-]* { return firstChar + suffix.join(''); }

only              = "only:" / "=" { return "="; }
modifier          = only:only { return only }

scopeSuffix       =
  dot:"." id:identifier { return dot + id; }

scope             =
  prefix:identifier suffix:scopeSuffix* { return prefix + suffix.join(''); }

scopeWithSpace    =
  _ scope:scope { return scope; }

singleScope       =
  scope:scope { return [scope]; }

multiScopes       =
  scope:scope scopes:(scopeWithSpace)+ { return Array.prototype.concat.call([scope], scopes); }

groupedScopes     =
  "(" scopes:(multiScopes / singleScope) ")" { return scopes; }

modifiedScopes    =
  _ modifier:modifier scopes:(groupedScopes / singleScope) { return [modifier, scopes] }

unmodifiedScopes  =
  _ scopes:(groupedScopes / multiScopes / singleScope) { return ["@", scopes]; }

scopes            =
  modifiedScopes / unmodifiedScopes
