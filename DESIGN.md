# Design notes

## Architecture

`src/logic` contains DOM-free functions and immutable game-state transformations. `src/main.ts` owns side effects: event listeners, reading the clock, `Math.random`, DOM creation and `localStorage`. `index.html` contains no authored body elements other than its ES-module `<script>`; all interface nodes are built using `document.createElement`, `textContent` and `append`.

- `GameState` is a record (`phase`, `base`, `length`, `secret`, timestamps, `history`). Its readonly history is an ordered array of immutable `{guess, bulls, cows}` records. This preserves previous attempts and makes replay and tests straightforward.
- `configureGame`, `startGame`, `submitGuess`, `resetGame` return **new state objects** rather than editing existing state. `submitGuess` uses `[...state.history, entry]`. Duplicate guesses are rejected case-insensitively without adding a history record.
- `Score` stores base, length, attempt count, elapsed milliseconds and timestamp. `rankScores` groups by `{base,length}`, sorts by fewest attempts then shortest time, and retains the five best for each group. `localStorage` access and error handling remain in the UI layer.

## Algorithms

**`generateSecret(length, base, random)`** creates an alphabet of `base` distinct symbols and makes `length` steps of a partial Fisher–Yates shuffle. At each step the injected `random()` value selects one unused symbol uniformly (for uniform random input). It returns the chosen prefix as a string; zero is allowed at position 0. Supplying a deterministic `random` makes tests repeatable. `Math.random` is the convenience default for the UI; full deterministic purity is achieved with injected randomness.

**`evaluateGuess(secret, guess)`** normalizes both strings to uppercase, then filters secret digits twice: first for equal positions (bulls), second for digits at a different position that are present in the guess (cows). The result is `{bulls,cows}`. Valid guesses contain no repeated digits, so a digit cannot be counted more than once. Array methods implement the higher-order transformations instead of mutable counters.

**`isValidGuess(guess, length, base)`** requires the chosen length, checks every symbol with the predicate produced by `createDigitValidator(base)`, and detects case-insensitive repeated digits with `Set`.

**`createDigitValidator(base)`** returns a closure over a radix-specific alphabet: one selected base is reused to check multiple single characters, both in validation and during interactive typing/pasting.

**`countPossibleSecrets(length, base)`** computes the number of sequences of unique symbols by the recurrence `P(base, 0) = 1`, `P(base, length) = base × P(base - 1, length - 1)`. A leading zero is allowed, so no results are subtracted. A private `Map` caches values by `length:base` to avoid recalculating values whenever settings are shown.

## Complexity

Let `n` denote secret/guess length and `b` the numeral base, with `2 ≤ b ≤ 16` in this game.

| Function | Time | Extra space | Reason |
| --- | --- | --- | --- |
| `generateSecret` | `O(b + n)` | `O(b)` | Build/shuffle the alphabet and sample `n` positions. |
| `evaluateGuess` | `O(n²)` | `O(n)` | Two `filter` passes; `includes` may scan `n` elements for each character. Uppercase copies cost `O(n)`. |
| `isValidGuess` | `O(n × b + b)` | `O(n + b)` | Construct an alphabet of length `b`, validate `n` characters against it and check a `Set`. |
| `countPossibleSecrets` | `O(n)` on first uncached call; `O(1)` for a cached key | `O(n)` stack and cache entries for the first call | Each recursive call reduces the remaining length by one; memoized results reuse earlier calculations. |

These estimates explicitly retain `b` despite its small fixed bound, rather than silently treating the available alphabet as unlimited.

## Clean code and functional programming

- **Single responsibility:** each rule (`evaluateGuess`, `isValidGuess`, `generateSecret`) has one task; `main.ts` handles browser interactions instead of importing DOM into the core.
- **Dependency injection:** `generateSecret` accepts `random` rather than hardcoding the source of randomness; `startGame` and `submitGuess` receive timestamps instead of reading the clock.
- **Immutability:** `src/logic/game.ts` uses readonly types, spread objects and `[...history, attempt]`, not mutation of prior history.
- **Higher-order functions:** `evaluateGuess` uses `filter`; validation uses `every`; history uses `some`; scores use `filter`, `sort`, `flatMap` on new arrays.
- **Closure and currying-like predicate factory:** `createDigitValidator` closes over the selected alphabet; callers configure it once and reuse it.
- **Recursion and memoization:** `countPossibleSecrets` follows the permutation recurrence and caches results.
- **Defensive boundaries:** input is checked for length, allowed symbols and duplicates; score storage is parsed with runtime shape checks; localStorage failures do not crash the round.
- **Semantic naming:** functions express intent (`submitGuess`, `resetGame`, `rankScores`), while `GameState` and `Score` make the state shape explicit.

## Testing approach

Each required pure function has deterministic, independent Vitest tests covering its behavior and boundaries. `generateSecret` tests inject a controlled random source. Red tests and green implementations belong to separate commits per required function; the pre-commit hook runs lint-staged only, while pre-push runs all tests. Pure game-state transitions and ranking have additional regression tests.
