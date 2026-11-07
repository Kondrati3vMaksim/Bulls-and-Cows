# Bulls & Cows

TypeScript browser game for the RS School functional programming / TDD task.

## Development

Requires Node.js 22 or later.

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

Start a static HTTP server at the repository root after compiling:

```bash
npx http-server . -p 8080
```

Open `http://localhost:8080`. Opening `index.html` directly from `file://` is unsupported because JavaScript ES modules require an HTTP origin.

## Controls

Choose binary, octal, decimal or hexadecimal. Set a secret length of 2–6 digits (no length above the base), press **Начать игру**, then submit guesses containing distinct legal digits. A bull means a correct digit in the correct place; a cow means a correct digit in a different place. The input is case-insensitive for hexadecimal. The leaderboard is stored in your browser, separately for each base/length combination.

## Implementation

All DOM elements are created in TypeScript using `document.createElement`. `index.html` contains only the module script in its body. Pure rules live in `src/logic`, independently of the UI. Detailed design and Big-O discussion: [DESIGN.md](DESIGN.md).

## Deployment

Live demo: https://sunny-marshmallow-3df434.netlify.app/.

GitHub Actions checks types, lint, tests, and compilation. The Netlify deployment was uploaded separately; pushing changes to GitHub does not automatically republish it.

Do not merge the assignment PR into `main` before cross-check grading.
