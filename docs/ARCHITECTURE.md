# Hollow Crown - Architecture

This document explains how the game is organized and **why**. It is written for a beginner. Read it before changing anything, and update it when a decision changes. If code and this document disagree, fix one of them.

## 1. The big idea

The game is split into three layers. Information only flows in one direction between them.

| Layer | Where it lives | Job | May use Phaser / browser? |
|---|---|---|---|
| **Core** | `packages/core` | The rules: movement, collision, combat, loot, dungeon generation, saving format, content import validation | **No** |
| **Client** | `apps/client` | Draws the game, reads keyboard/mouse/controller, plays sound, shows menus and HUD | Yes |
| **Content** | data inside core (and imported packs) | Items, enemies, rooms, loot tables described as **data**, not code | n/a |

Why separate them? Because the rules then work without a screen. That lets us:

- test combat and loot with fast automated tests,
- run the exact same rules on a future multiplayer server,
- swap or upgrade the rendering without touching game rules.

## 2. Technology

- **TypeScript**: catches mistakes early.
- **Vite**: dev server and production build (output is plain static files you can host anywhere).
- **Phaser 3**: drawing, input, audio only. We do **not** use Phaser's physics or game objects as the source of truth.
- **Vitest**: automated tests.
- **npm workspaces**: one repository, several packages (`core`, `client`, later `server`).
- **Zod** (added when the import pipeline is built): validates imported JSON.

## 3. Folder map

```
packages/core/src/
  sim/        game loop step, world state, entities
  systems/    movement, collision, combat, ai, loot, status effects (one job each)
  content/    registries + built-in item/enemy/room definitions
  dungeon/    room templates and the floor generator
  import/     validation and registration of custom content packs
  save/       save data format and version migrations
  util/       seeded random numbers, math helpers, ID helpers
apps/client/src/
  render/     Phaser scenes that draw core state
  input/      keyboard / mouse / controller -> commands
  ui/         HUD, menus, inventory screen
  audio/      sound and music, driven by events
  state/      client game states: menu, playing, paused, game over
apps/server/  (future) multiplayer server running the same core
docs/         this file, the content pack spec, contributor rules
content-packs/ example packs for testing the importer
```

## 4. How the pieces talk

```
Input -> Commands -> Core simulation step -> New state + Events -> Renderer / UI / Audio
```

- **Commands** are small messages such as `{ playerId: 1, move: [1, 0], aim: [0, -1], attack: true }`. The client never edits game state directly.
- The **simulation** advances in fixed steps (for example 60 per second), independent of the screen's frame rate.
- **State** is plain serializable data: entities with IDs, positions, health, inventory. Systems are separate functions that each do one job.
- **Events** describe what happened ("enemy took 5 damage", "chest opened"). The renderer, UI, and audio **listen** for events to show a hit flash or play a sound. Core never calls them directly.
- **Registries** are lookup tables: `items.get("core:iron_sword")`. Built-in and imported content use the same registries and the same definition format.

## 5. Controls (decided)

- **Controller:** twin-stick. Left stick moves, right stick aims and attacks.
- **Keyboard and mouse:** WASD to move, mouse to aim and click to attack (default; easy to change later).
- All schemes are translated into the **same commands** in `apps/client/src/input`, so the core never knows which device is used.

## 6. Multiplayer-compatibility rules

Multiplayer is **not** being built yet. These rules keep it possible. They are enforced where practical by `packages/core/src/purity.test.ts`.

1. Fixed-timestep simulation, independent of frame rate.
2. **No `Math.random()` or wall-clock time in core.** Use `SeededRng` and the simulation tick count. Same seed means same dungeon and same loot.
3. All state is plain, serializable data (no class instances holding hidden state, no functions inside state).
4. Input is a command tagged with a player ID. The world holds a **list** of players, never "the player".
5. No global variables or singletons in core. The world is passed into functions.
6. The renderer only reads state. It may smooth movement visually but never decides outcomes.

**Likely future model:** an authoritative server. Clients send commands, the server runs the core simulation and sends results, and clients predict locally for responsiveness. Solo play runs the same core locally in the browser.

## 7. Custom content import (design)

Full spec: [CONTENT_PACK_FORMAT.md](./CONTENT_PACK_FORMAT.md).

- Imported files are **JSON data only**. They can never contain code.
- Effects reference a fixed vocabulary built into the game ("stat bonus", "apply status on hit", ...). Packs combine and tune effects with numbers but cannot invent new behavior.
- Pipeline: size check -> parse -> version check/migrate -> schema validate -> balance limits -> preview -> register.
- Every registered definition carries `source: "builtin" | "imported"` and a pack ID, so a pack can be removed cleanly.
- Imported IDs are namespaced (`imported:<packId>:<itemId>`) so they can never overwrite built-in content.

## 8. Decisions log

| Decision | Status |
|---|---|
| Stack: TypeScript + Vite + Phaser 3 + Vitest, npm workspaces | Decided |
| Isaac-style discrete rooms connected by doors | Decided |
| Controls: controller twin-stick; keyboard WASD + mouse | Decided |
| Runs in the browser; client is a static site hosted separately from any backend | Decided |
| Single-file HTML build (open without a server) | Planned after the game is playable |
| Authoritative-server multiplayer | Preferred direction, not built |
| Whether Base44 can host a real-time game server | **Open**: verify before multiplayer; otherwise use a small separate Node host |
| Effect vocabulary and balance limits for imported loot | **Open** |
| Imported images (built-in icon IDs only in v1?) | **Open** (recommend icon IDs only) |
| Imported content in co-op (pack hash check) | **Open** (design now, build later) |
| Art style and tile size | **Open** (placeholder shapes first) |
| Art and audio asset licensing | **Open** |

## 9. Roadmap

1. **Setup**: repo, tooling, folder skeleton, docs. *(this step)*
2. A square moves around one room with walls (core simulation + client rendering).
3. Player health and damage; a basic chasing enemy.
4. Combat: melee hitbox, telegraphed enemy attack, ranged attack.
5. Enemy registry and item registry with the shared definition format.
6. Equipment and stats.
7. Loot drops and rarity (seeded).
8. Dungeon: room templates, floor generator, doors, floor transitions.
9. UI and game states: menu, pause, game over, HUD, inventory.
10. Versioned save data.
11. Audio hooks driven by events.
12. Custom content import v1: schema, validation, preview, registration, removal.
13. First boss; balance and polish.
14. Multiplayer prep: run the simulation headless in Node, then build the server.
