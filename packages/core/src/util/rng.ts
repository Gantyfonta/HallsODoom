/**
 * Seeded random number generator (mulberry32).
 *
 * WHY THIS EXISTS: the game core must never use Math.random(). If every random
 * choice comes from a seeded generator, then the same seed always produces the
 * same dungeon and the same loot. That makes bugs reproducible, lets saves
 * restore a run exactly, and lets a future multiplayer server and its clients
 * agree on what was generated.
 */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    // Force the seed into an unsigned 32-bit integer.
    this.state = seed >>> 0;
  }

  /** Next float in the range [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Random whole number from min to max, both included. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Pick one item from a non-empty list. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("SeededRng.pick: cannot pick from an empty list");
    }
    return items[this.int(0, items.length - 1)] as T;
  }

  /** True with the given probability (0 to 1). */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** Save the generator's position so a run can be restored exactly. */
  getState(): number {
    return this.state;
  }

  /** Restore a position previously returned by getState(). */
  setState(state: number): void {
    this.state = state >>> 0;
  }
}
