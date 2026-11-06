import { describe, expect, test } from 'vitest';
import { configureGame, createInitialState, resetGame, startGame, submitGuess } from '../src/logic/game';
import { parseScores, rankScores } from '../src/logic/leaderboard';
describe('game state', () => {
  test('locks settings, appends attempts immutably, refuses repeats', () => {
    const original = createInitialState();
    const configured = configureGame(original, 10, 4);
    const started = startGame(configured, '0123', 1000);
    expect(configureGame(started, 16, 6)).toBe(started);
    const first = submitGuess(started, '1234', 2000);
    expect(first.error).toBeNull();
    expect(started.history).toEqual([]);
    expect(first.state.history).toEqual([{ guess: '1234', bulls: 0, cows: 3 }]);
    const repeated = submitGuess(first.state, '1234', 3000);
    expect(repeated.error).not.toBeNull();
    expect(repeated.state).toBe(first.state);
  });
  test('recognizes win and resets without a page reload', () => {
    const started = startGame(createInitialState(), '0123', 1000);
    const result = submitGuess(started, '0123', 3500);
    expect(result.newlyWon).toBe(true);
    expect(result.state.phase).toBe('won');
    expect(result.state.finishedAt).toBe(3500);
    expect(result.state.history).toHaveLength(1);
    expect(resetGame(result.state).phase).toBe('setup');
  });
  test('binary base forces length two', () => {
    expect(configureGame(createInitialState(), 2, 6).length).toBe(2);
  });
});
describe('leaderboard', () => {
  test('orders entries by attempts and elapsed time without changing source', () => {
    const a = { base: 10 as const, length: 4, attempts: 3, elapsedMs: 9000, achievedAt: 1 };
    const b = { base: 10 as const, length: 4, attempts: 2, elapsedMs: 6000, achievedAt: 2 };
    const c = { base: 10 as const, length: 4, attempts: 2, elapsedMs: 3000, achievedAt: 3 };
    const source = [a, b, c];
    expect(rankScores(source)).toEqual([c, b, a]);
    expect(source).toEqual([a, b, c]);
  });
  test('ignores corrupt storage data', () => {
    expect(parseScores('invalid JSON')).toEqual([]);
    expect(parseScores('{"not":"array"}')).toEqual([]);
  });
});
