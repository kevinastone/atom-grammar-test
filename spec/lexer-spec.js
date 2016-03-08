'use babel';

import { lex, parse } from '../lib/lexer';
import { escapeSpecName } from '../lib/jasmine';


function itShouldLex(expression) {
  it(`should lex: ${escapeSpecName(expression)}`, () => {
    expect(() => lex(expression)).not.toThrow();
  });
}

function itShouldNotLex(expression) {
  it(`should not lex: ${escapeSpecName(expression)}`, () => {
    expect(() => lex(expression)).toThrow();
  });
}

function itShouldParse(expression) {
  it(`should parse: ${escapeSpecName(expression)}`, () => {
    expect(() => parse(lex(expression))).not.toThrow();
  });
}

function itShouldNotParse(expression) {
  it(`should not parse: ${escapeSpecName(expression)}`, () => {
    expect(() => parse(lex(expression))).toThrow();
  });
}


describe('Grammar', () => {
  describe('Lexing', () => {
    itShouldLex('// <- ');
    itShouldLex('   // <- ');
    itShouldLex('// << ');
    itShouldLex('// >> ');
    itShouldLex('// <- something');
    itShouldLex('// <-        something');
    itShouldLex('// <- =something');
    itShouldLex('// <- only:something');
    itShouldLex('// <- only:something.else');
    itShouldLex('// <- only:something.else');
    itShouldLex('// <- only:(something.else another)');
    itShouldLex('// <- only:(something.else)');

    itShouldNotLex('##');
    itShouldNotLex('<>');
    itShouldNotLex('//<- %something');
    itShouldNotLex('// <- %something');
    itShouldNotLex('// <- %something');
  });

  describe('Parsing', () => {
    describe('OpenToken', () => {
      itShouldParse('// << something');
      itShouldParse('   // << something');
      itShouldParse('   // << something');
    });
    describe('Positions', () => {
      itShouldParse('// << something');
      itShouldParse('// >> something');
      itShouldParse('// <- something');
      itShouldParse('//  ^ something');
      itShouldParse('//    ^ something');
      itShouldParse('// ^  ^ something');
      itShouldParse('// ^^^^ something');
      itShouldParse('// ^  ^ something.else another');

      itShouldNotParse(' something');
      itShouldNotParse('    something');
      itShouldNotParse('//  something');
      itShouldNotParse('   // something');
      itShouldNotParse('// <> something');
      it('should parse start of line', () => {
        expect(parse(lex('  // << something'))).toEqual([
          [0],
          ['@', ['something']],
        ]);
      });

      it('should parse end of line', () => {
        expect(parse(lex('  // >> something'))).toEqual([
          [-1],
          ['@', ['something']],
        ]);
      });

      it('should parse prefixed whitespace', () => {
        expect(parse(lex('  // <- something'))).toEqual([
          [3],
          ['@', ['something']],
        ]);
      });

      it('should parse single carat', () => {
        expect(parse(lex('  // ^ something'))).toEqual([
          [7],
          ['@', ['something']],
        ]);
      });

      it('should parse multiple carats', () => {
        expect(parse(lex('  // ^   ^ something'))).toEqual([
          [7, 11],
          ['@', ['something']],
        ]);
      });
    });

    describe('Scopes', () => {
      itShouldParse('// << something');
      itShouldParse('// << something.else');
      itShouldParse('// << something another');
      itShouldParse('// << something another.else');
      itShouldParse('// << (something)');
      itShouldParse('// << (something.else)');
      itShouldParse('// << (something another.else)');
      itShouldParse('// << =(something)');
      itShouldParse('// << =(something.else)');
      itShouldParse('// << =(something another.else)');
      itShouldParse('// << only:(something)');
      itShouldParse('// << only:(something.else)');
      itShouldParse('// << only:(something another.else)');

      itShouldNotParse('// << something.');
      itShouldNotParse('// << .something');
      itShouldNotParse('// << .');
      itShouldNotParse('// << ()');
      itShouldNotParse('// << =');
      itShouldNotParse('// << =()');
      itShouldNotParse('// << =:something another');
      itShouldNotParse('// << only:');
      itShouldNotParse('// << only:()');
      itShouldNotParse('// << only:something another');

      it('should parse a single scope', () => {
        expect(parse(lex('// << something'))).toEqual([
          [0],
          ['@', ['something']],
        ]);
      });

      it('should parse a single nested scope', () => {
        expect(parse(lex('// << something.else'))).toEqual([
          [0],
          ['@', ['something.else']],
        ]);
      });

      it('should parse multiple scopes', () => {
        expect(parse(lex('// << something another'))).toEqual([
          [0],
          ['@', ['something', 'another']],
        ]);
      });

      it('should parse a modified single scope', () => {
        expect(parse(lex('// << =something'))).toEqual([
          [0],
          ['=', ['something']],
        ]);
      });

      it('should parse a modified grouped single scope', () => {
        expect(parse(lex('// << only:(something)'))).toEqual([
          [0],
          ['=', ['something']],
        ]);
      });

      it('should parse a single modified nested scope', () => {
        expect(parse(lex('// << =something.else'))).toEqual([
          [0],
          ['=', ['something.else']],
        ]);
      });

      it('should parse modified multiple scopes', () => {
        expect(parse(lex('// << =(something another)'))).toEqual([
          [0],
          ['=', ['something', 'another']],
        ]);
      });
    });
  });
});