# Working Rules (for humans and AI assistants)

Hollow Crown is built by one beginner developer with help from several AI tools. These rules keep the codebase consistent. Please follow them.

1. **Read `docs/ARCHITECTURE.md` first.** It is the source of truth for structure.
2. **Core stays pure.** Nothing in `packages/core` may import Phaser, touch the DOM or browser storage, use `Math.random()`, or read the clock. `npm test` enforces this.
3. **Game rules go in core; drawing and UI go in the client.** If you are unsure, ask which layer it belongs to.
4. **Content is data.** Items, enemies, and rooms are definitions in the shared format, not hard-coded logic. Imported content must never be able to run code.
5. **Small, understandable changes.** Prefer clear names and short files over clever tricks. Add a comment explaining *why* for anything non-obvious.
6. **Add a test** for new game rules in core.
7. **Before pushing:** `npm run typecheck` and `npm test` must pass.
8. **Do not add dependencies casually.** Explain why a new package is needed.
9. **Do not make the game depend on Base44 or any AI service.** Those are optional extras around the game.
10. **Update the docs** when a decision changes.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (run once, and after dependency changes) |
| `npm run dev` | Start the game locally with live reload |
| `npm run build` | Produce the static site in `apps/client/dist` |
| `npm run typecheck` | Check TypeScript types in all packages |
| `npm test` | Run automated tests |
