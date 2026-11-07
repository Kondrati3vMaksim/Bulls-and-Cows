import { describe, expect, test } from 'vitest';
import { createDigitValidator } from '../src/logic/createDigitValidator';
describe('createDigitValidator', () => {
  test('binary accepts 0 and 1 only', () => {
    const check = createDigitValidator(2);
    expect(check('0')).toBe(true);
    expect(check('1')).toBe(true);
    expect(check('2')).toBe(false);
  });
  test('octal boundary', () => {
    const check = createDigitValidator(8);
    expect(check('0')).toBe(true);
    expect(check('7')).toBe(true);
    expect(check('8')).toBe(false);
  });
  test('decimal boundary', () => {
    const check = createDigitValidator(10);
    expect(check('0')).toBe(true);
    expect(check('9')).toBe(true);
    expect(check('A')).toBe(false);
  });
  test('hex accepts both letter cases', () => {
    const check = createDigitValidator(16);
    expect(check('9')).toBe(true);
    expect(check('A')).toBe(true);
    expect(check('a')).toBe(true);
    expect(check('F')).toBe(true);
    expect(check('f')).toBe(true);
    expect(check('G')).toBe(false);
  });
  test('rejects empty and multi-character inputs', () => {
    const check = createDigitValidator(16);
    expect(check('')).toBe(false);
    expect(check('12')).toBe(false);
    expect(check('AF')).toBe(false);
  });
  test('rejects unsupported bases', () => {
    expect(createDigitValidator(1)('0')).toBe(false);
    expect(createDigitValidator(17)('a')).toBe(false);
  });
});
