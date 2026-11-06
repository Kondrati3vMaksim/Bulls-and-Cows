const cache = new Map<string, number>();

/** Number of length-long sequences without repeated digits; leading zero allowed. */
export function countPossibleSecrets(length: number, base: number): number {
  if (!Number.isInteger(length) || !Number.isInteger(base) || length < 0 || length > base || base < 0 || base > 16) {
    return 0;
  }

  const key = `${length}:${base}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const result = length === 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1);
  cache.set(key, result);
  return result;
}
