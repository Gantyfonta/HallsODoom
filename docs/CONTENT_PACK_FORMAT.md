# Content Pack Format (DRAFT, version 1)

A **content pack** is a single JSON file that adds custom loot to Hollow Crown. Packs will be produced by the separate Loot Workshop app and imported by the game.

> Status: design draft. The importer is not built yet (roadmap step 12). Numbers marked *tunable* will be decided during balancing.

## Safety rules

- A pack is **data only**. It cannot contain JavaScript or any executable code.
- Unknown fields are **rejected**, not ignored.
- Effects come from a fixed vocabulary in the game. A pack may select effects and set their numbers, nothing more.
- Imported content can never replace built-in content (IDs are namespaced).
- Files over a size limit (*tunable*, suggest 1 MB) are rejected before parsing.

## Top-level shape

```json
{
  "format": "hollow-crown-pack",
  "formatVersion": 1,
  "pack": {
    "id": "frostforge",
    "name": "Frostforge Arsenal",
    "author": "Someone",
    "version": "1.0.0",
    "description": "Icy weapons and armor."
  },
  "items": [ ],
  "enchantments": [ ]
}
```

| Field | Rule |
|---|---|
| `format` | Must equal `"hollow-crown-pack"` |
| `formatVersion` | Integer. Old versions are migrated forward on import; newer-than-supported versions are rejected with a clear message |
| `pack.id` | Lowercase letters, digits, underscores; 3-32 characters; unique among installed packs |
| `pack.name`, `author` | Plain text, length-limited (HTML/markup is never rendered) |
| `pack.version` | Semantic version string |

## Item definitions

All item kinds share one base shape. The `type` field selects the kind.

Supported `type` values: `weapon`, `armor`, `accessory`, `artifact`, `relic`. Enchantments are listed separately under `enchantments` because they attach to other items.

```json
{
  "id": "frost_blade",
  "type": "weapon",
  "name": "Frost Blade",
  "description": "Cold enough to numb the hand that wields it.",
  "rarity": "rare",
  "icon": "builtin:sword_01",
  "stats": { "damage": 12, "attackSpeed": 1.1 },
  "effects": [
    { "kind": "applyStatus", "status": "chill", "chance": 0.2, "durationSeconds": 3 }
  ]
}
```

| Field | Rule |
|---|---|
| `id` | Unique within the pack. Registered in the game as `imported:<packId>:<id>` |
| `rarity` | `common`, `uncommon`, `rare`, `epic`, `legendary` (final list *tunable*) |
| `icon` | v1: only built-in icon IDs. Custom images are deferred (open decision) |
| `stats` | Only stat names allowed for that `type`. Each value is clamped or rejected by the **balance limits** for its rarity |
| `effects` | From the fixed effect vocabulary below |

### Allowed stats by type (initial proposal)

- `weapon`: `damage`, `attackSpeed`, `range`, `projectileSpeed`, `critChance`
- `armor`: `defense`, `maxHealth`, `moveSpeed`
- `accessory`, `artifact`, `relic`: any of the above, plus `luck`, `pickupRadius`

### Effect vocabulary (initial proposal)

| `kind` | Parameters | Meaning |
|---|---|---|
| `statBonus` | `stat`, `amount` or `percent` | Flat or percentage stat change while equipped |
| `applyStatus` | `status`, `chance`, `durationSeconds` | Chance to apply a status (burn, chill, poison, ...) on hit |
| `healOnKill` | `amount` | Restore health when an enemy dies |
| `lifeSteal` | `percent` | Heal a fraction of damage dealt |
| `onHitProjectile` | `projectile`, `chance` | Chance to fire a built-in projectile on hit |
| `damageAura` | `radius`, `damagePerSecond` | Damage nearby enemies over time |

Adding a new effect `kind` is a **code change in the game** (reviewed like any other change), never something a pack can do.

## Enchantments

```json
{
  "id": "frostbite",
  "name": "of Frostbite",
  "appliesTo": ["weapon"],
  "rarity": "uncommon",
  "stats": { "damage": 2 },
  "effects": [ { "kind": "applyStatus", "status": "chill", "chance": 0.1, "durationSeconds": 2 } ]
}
```

## Import pipeline

1. **Size check**, then parse JSON (reject on syntax error).
2. **Version check**: migrate older `formatVersion`s forward; reject newer ones.
3. **Schema validation** (strict; unknown fields rejected).
4. **Balance validation** against per-rarity limits.
5. **Preview**: show the player each item's name, rarity, stats, effects, and any warnings. Nothing is registered yet.
6. **Register** on confirmation, under namespaced IDs, tagged `source: "imported"` with the pack ID.
7. **Persist** the pack (browser storage in the client) so it loads on next start.
8. **Remove**: unregister every definition from that pack and delete it from storage.

## Removing a pack that is in use

If a save or active run contains an item from a removed pack, the game replaces it with a harmless placeholder or removes it, and tells the player. Saves never crash because a pack is missing.

## Multiplayer note (future)

In co-op, all players must have identical imported content. The game will compute a hash of each pack and the server will verify it. Not built yet; the format stays deterministic so this is possible.
