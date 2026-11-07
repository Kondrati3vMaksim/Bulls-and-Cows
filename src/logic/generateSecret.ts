import { DIGITS } from './createDigitValidator.js';

/** Sample without replacement using a partial Fisher–Yates shuffle. */
export function generateSecret(length: number, base: number, random: () => number = Math.random): string {
  if (!Number.isInteger(base) || ![2, 8, 10, 16].includes(base) || !Number.isInteger(length) || length < 2 || length > 6 || length > base) {
    throw new RangeError('Unsupported length or numeral system');
  }

  const digits = Array.from(DIGITS.slice(0, base));
  for (let index = 0; index < length; index += 1) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError('Random generator must return a value in [0, 1)');
    }
    const choice = index + Math.floor(value * (base - index));
    [digits[index], digits[choice]] = [digits[choice]!, digits[index]!];
  }

  return digits.slice(0, length).join('');
}
