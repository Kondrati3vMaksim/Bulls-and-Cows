import { createDigitValidator } from './createDigitValidator.js';

export function isValidGuess(guess: string, length: number, base: number): boolean {
  if (!Number.isInteger(length) || length < 2 || length > 6 || length > base) {
    return false;
  }

  const digits = Array.from(guess.toLowerCase());
  const isDigit = createDigitValidator(base);

  return digits.length === length && digits.every(isDigit) && new Set(digits).size === length;
}
