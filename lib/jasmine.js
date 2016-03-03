'use babel';

// Jasmine filters tags of the format #whatever, so we need to ensure we
// don't accidentally tag by sneakingly placing a zero-width space to
// break their logic so #whatever -> \u200b#whatever based on this logic:
// https://github.com/atom/jasmine-tagged/blob/master/src/jasmine-tagged.coffee#L14-L15
export function escapeSpecName(name) {
  return name.replace(/#/, '\u200b#');
}
