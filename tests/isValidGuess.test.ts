import { describe, expect, test } from 'vitest';
import { isValidGuess } from '../src/logic/isValidGuess';
describe('isValidGuess', () => {
  test('checks exact length', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
    expect(isValidGuess('123', 4, 10)).toBe(false);
    expect(isValidGuess('01234', 4, 10)).toBe(false);
  });
  test('checks digits for the chosen base', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('02', 2, 2)).toBe(false);
    expect(isValidGuess('78', 2, 8)).toBe(false);
    expect(isValidGuess('79', 2, 10)).toBe(true);
  });
  test('rejects duplicate symbols even with different hex letter case', () => {
    expect(isValidGuess('A1a2', 4, 16)).toBe(false);
    expect(isValidGuess('A1b2', 4, 16)).toBe(true);
    expect(isValidGuess('1123', 4, 10)).toBe(false);
  });
  test('rejects a missing or invalid character', () => {
    expect(isValidGuess('', 2, 10)).toBe(false);
    expect(isValidGuess('0 ', 2, 10)).toBe(false);
    expect(isValidGuess('0G', 2, 16)).toBe(false);
  });
  test('enforces allowed lengths', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('012', 3, 2)).toBe(false);
    expect(isValidGuess('0123456', 7, 10)).toBe(false);
  });
});
