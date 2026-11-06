import type { Base } from './game.js';

export interface Score {
  readonly base: Base;
  readonly length: number;
  readonly attempts: number;
  readonly elapsedMs: number;
  readonly achievedAt: number;
}

const scoreIsValid = (item: unknown): item is Score => {
  if (typeof item !== 'object' || item === null) return false;
  const value = item as Record<string, unknown>;
  return (
    [2, 8, 10, 16].includes(value.base as number) &&
    typeof value.length === 'number' && Number.isInteger(value.length) && value.length >= 2 && value.length <= 6 && value.length <= (value.base as number) &&
    typeof value.attempts === 'number' && Number.isInteger(value.attempts) && value.attempts > 0 &&
    typeof value.elapsedMs === 'number' && Number.isFinite(value.elapsedMs) && value.elapsedMs >= 0 &&
    typeof value.achievedAt === 'number' && Number.isFinite(value.achievedAt)
  );
};

/** Stable, deterministic ranking per settings (fewest attempts, then fastest). */
export function rankScores(scores: readonly Score[], limit = 5): Score[] {
  const groups = new Map<string, Score[]>();
  scores.filter(scoreIsValid).forEach((score) => {
    const key = `${score.base}:${score.length}`;
    const group = groups.get(key) ?? [];
    groups.set(key, [...group, score]);
  });
  return Array.from(groups.values()).flatMap((group) =>
    [...group]
      .sort((a, b) => a.attempts - b.attempts || a.elapsedMs - b.elapsedMs || a.achievedAt - b.achievedAt)
      .slice(0, limit),
  );
}

export function parseScores(json: string | null): Score[] {
  if (!json) return [];
  try {
    const data: unknown = JSON.parse(json);
    return Array.isArray(data) ? rankScores(data) : [];
  } catch {
    return [];
  }
}
