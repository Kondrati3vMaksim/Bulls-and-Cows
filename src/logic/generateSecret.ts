export function generateSecret(length: number, base: number, random: () => number = Math.random): string {
  void base;
  void random;
  return '0'.repeat(length);
}
