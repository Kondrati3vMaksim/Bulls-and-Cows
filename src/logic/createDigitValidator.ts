/** Digits are ordered by their numeric value in any supported positional base. */
export const DIGITS = '0123456789abcdef';

/** Create a single-character predicate for the selected radix. */
export function createDigitValidator(base: number): (char: string) => boolean {
  const alphabet = Number.isInteger(base) && base >= 2 && base <= 16 ? DIGITS.slice(0, base) : '';

  return (char: string): boolean => char.length === 1 && alphabet.includes(char.toLowerCase());
}
