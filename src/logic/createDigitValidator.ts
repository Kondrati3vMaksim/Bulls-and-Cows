export const DIGITS = '0123456789abcdef';
export function createDigitValidator(base: number): (char: string) => boolean {
  void base;
  return (char: string) => {
    void char;
    return false;
  };
}
