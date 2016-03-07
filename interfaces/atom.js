declare function waitsForPromise(func: () => mixed): void;

interface Atom$Packages {
  activatePackage(name: string): void;
}

type AtomGlobal = {
  packages: Atom$Packages;
}

declare var atom: AtomGlobal;
