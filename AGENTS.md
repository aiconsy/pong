# AGENTS.md

## Cursor Cloud specific instructions

This is a vanilla JavaScript Pong game using **Vite** (dev server / bundler), **Vitest** (testing), and **ESLint** (linting).

### Quick reference

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Tests | `npm run test` |
| Build | `npm run build` |

### Notes

- The dev server runs on port **3000** with `--host` to allow external access.
- Game logic lives in `src/game.js`; rendering + input handling in `src/main.js`.
- Tests cover game logic only (`src/game.test.js`). Browser globals (document, window, etc.) are handled via ESLint config, not a separate globals package.
- No external services or databases are required — this is a purely client-side application.
