import { describe, expect, test } from 'vitest';
import { generateSecret } from '../src/logic/generateSecret';
import { isValidGuess } from '../src/logic/isValidGuess';
describe('generateSecret', () => {
  test('uses injected random source predictably', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
    expect(generateSecret(2, 2, () => 0)).toBe('01');
  });
  test('supports leading zero and different bases', () => {
    expect(generateSecret(4, 16, () => 0).startsWith('0')).toBe(true);
    expect(generateSecret(2, 8, () => 0).startsWith('0')).toBe(true);
  });
  test('generates distinct digits for every supported base', () => {
    for (const base of [2, 8, 10, 16]) {
      const length = Math.min(6, base);
      for (const fraction of [0, 0.2, 0.8, 0.999999]) {
        const secret = generateSecret(length, base, () => fraction);
        expect(isValidGuess(secret, length, base)).toBe(true);
      }
    }
  });
  test('rejects impossible length and invalid random results', () => {
    expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
    expect(() => generateSecret(7, 16, () => 0)).toThrow(RangeError);
    expect(() => generateSecret(4, 10, () => 1)).toThrow(RangeError);
  });
});
