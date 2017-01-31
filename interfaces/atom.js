declare function waitsForPromise(func: () => mixed): void;

interface Atom$Packages {
  activatePackage(name: string): void;
}

type Atom$Grammar$Token = {
  scopes: Array<string>,
  value: string,
};
type Atom$Grammar$Rule = any;

interface Atom$Grammar {
  tokenizeLine(line: string, ruleStack: ?Array<Atom$Grammar$Rule>, firstLine: boolean)
    : {tokens: Array<Atom$Grammar$Token>, ruleStack: Array<Atom$Grammar$Rule>};
  tokenizeLines(text: string): Array<Atom$Grammar$Token>;
}

interface Atom$Grammars {
  grammarForScopeName(name: string): Atom$Grammar;
}

type AtomGlobal = {
  packages: Atom$Packages;
  grammars: Atom$Grammars;
}

declare var atom: AtomGlobal;
