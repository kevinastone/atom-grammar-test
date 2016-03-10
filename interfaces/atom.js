declare function waitsForPromise(func: () => mixed): void;

interface Atom$Packages {
  activatePackage(name: string): void;
}

type Atom$Grammar$Token = mixed;
type Atom$Grammar$Rule = any;

interface Atom$Grammar {
  tokenizeLine(line: string, ruleStack: ?Array<Atom$Grammar$Rule>, firstLine: boolean)
    : [Array<Atom$Grammar$Token>, Array<Atom$Grammar$Rule>];
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
