declare function it(description: string, func: () => mixed): void;
declare function describe(description: string, func: () => mixed): void;
declare function beforeEach(func: () => mixed): void;

type Expect = {
  toBeFalsy(): boolean;
  toBeTruthy(): boolean;
  toBe(value: any): boolean;
  toEqual(value: any): boolean;
  toThrow(): boolean;
  not: Expect;
}

declare function expect(subject: any): Expect;
