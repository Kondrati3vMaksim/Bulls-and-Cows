import { evaluateGuess } from './evaluateGuess.js';
import { isValidGuess } from './isValidGuess.js';

export type Base = 2 | 8 | 10 | 16;
export type Phase = 'setup' | 'playing' | 'won';

export interface Attempt {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
}

export interface GameState {
  readonly phase: Phase;
  readonly base: Base;
  readonly length: number;
  readonly secret: string | null;
  readonly startedAt: number | null;
  readonly finishedAt: number | null;
  readonly history: readonly Attempt[];
}

export interface Submission {
  readonly state: GameState;
  readonly error: string | null;
  readonly newlyWon: boolean;
}

export const createInitialState = (): GameState => ({
  phase: 'setup',
  base: 10,
  length: 4,
  secret: null,
  startedAt: null,
  finishedAt: null,
  history: [],
});

export function configureGame(state: GameState, base: Base, length: number): GameState {
  if (state.phase !== 'setup') return state;
  const safeLength = Math.min(6, Math.max(2, Math.min(base, length)));
  return { ...state, base, length: safeLength };
}

export function startGame(state: GameState, secret: string, now: number): GameState {
  if (state.phase !== 'setup' || !isValidGuess(secret, state.length, state.base)) {
    return state;
  }
  return { ...state, phase: 'playing', secret: secret.toUpperCase(), startedAt: now, finishedAt: null, history: [] };
}

export function submitGuess(state: GameState, guess: string, now: number): Submission {
  if (state.phase !== 'playing' || state.secret === null) {
    return { state, error: 'Начни новый раунд.', newlyWon: false };
  }
  if (!isValidGuess(guess, state.length, state.base)) {
    return { state, error: `Введи ${state.length} разных допустимых символа.`, newlyWon: false };
  }
  const normalized = guess.toUpperCase();
  if (state.history.some((item) => item.guess === normalized)) {
    return { state, error: 'Эта попытка уже была. Введи другую комбинацию.', newlyWon: false };
  }

  const { bulls, cows } = evaluateGuess(state.secret, normalized);
  const history = [...state.history, { guess: normalized, bulls, cows }];
  const newlyWon = bulls === state.length;
  return {
    state: { ...state, history, phase: newlyWon ? 'won' : 'playing', finishedAt: newlyWon ? now : null },
    error: null,
    newlyWon,
  };
}

export function resetGame(state: GameState): GameState {
  return { ...state, phase: 'setup', secret: null, startedAt: null, finishedAt: null, history: [] };
}
