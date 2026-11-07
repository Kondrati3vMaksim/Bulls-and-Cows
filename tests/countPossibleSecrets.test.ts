import { describe, expect, test } from 'vitest';
import { countPossibleSecrets } from '../src/logic/countPossibleSecrets';
describe('countPossibleSecrets', () => {
  test('counts all ordered choices including leading zero', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(2, 16)).toBe(240);
  });
  test('supports recursion base case', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
    expect(countPossibleSecrets(1, 8)).toBe(8);
  });
  test('rejects impossible lengths and repeats identically when memoized', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
    expect(countPossibleSecrets(-1, 10)).toBe(0);
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });
});
