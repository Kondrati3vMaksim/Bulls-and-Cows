/** Valid inputs have the same length and contain no repeated digits. */
export function evaluateGuess(secret: string, guess: string): { bulls: number; cows: number } {
  const arrSecret = secret.toUpperCase().split('');
  const arrGuess = guess.toUpperCase().split('');
  const findBulls = arrSecret.filter((item, index) => item === arrGuess[index]);
  const findCows = arrSecret.filter(
    (item, index) => item !== arrGuess[index] && arrGuess.includes(item),
  );
  return { bulls: findBulls.length, cows: findCows.length };
}
