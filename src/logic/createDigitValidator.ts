export const DIGITS = '0123456789abcdef';

export function createDigitValidator(base: number): (char: string) => boolean {
  const alphabet = Number.isInteger(base) && base >= 2 && base <= 16 ? DIGITS.slice(0, base) : '';

  return (char: string): boolean => char.length === 1 && alphabet.includes(char.toLowerCase());
}
