# Hollow Crown

A top-down dark fantasy action roguelike set in the ruins of the fallen kingdom of Eldoria. Runs in the browser.

**Status:** foundation only. A placeholder title screen renders; gameplay comes next.

## Quick start

You need [Node.js](https://nodejs.org) (current LTS or newer).

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Project layout

- `packages/core`: pure game rules (no rendering)
- `apps/client`: the browser game (Phaser draws, reads input, plays audio)
- `docs/`: architecture, content pack format, contributor rules
- `content-packs/`: example custom loot packs for testing

## Read next

- [Architecture](docs/ARCHITECTURE.md)
- [Content pack format](docs/CONTENT_PACK_FORMAT.md)
- [Working rules](docs/CONTRIBUTING.md)
