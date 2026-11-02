import { describe, expect, it } from "vitest";
import { SeededRng } from "./rng";

describe("SeededRng", () => {
  it("produces the same sequence for the same seed", () => {
    const a = new SeededRng(12345);
    const b = new SeededRng(12345);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = new SeededRng(1);
    const b = new SeededRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it("keeps next() within [0, 1)", () => {
    const rng = new SeededRng(99);
    for (let i = 0; i < 1000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("keeps int() within the inclusive range", () => {
    const rng = new SeededRng(7);
    for (let i = 0; i < 1000; i++) {
      const value = rng.int(3, 6);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(6);
    }
  });

  it("can save and restore its state", () => {
    const rng = new SeededRng(42);
    rng.next();
    rng.next();
    const saved = rng.getState();
    const expected = [rng.next(), rng.next()];
    rng.setState(saved);
    expect([rng.next(), rng.next()]).toEqual(expected);
  });

  it("throws when picking from an empty list", () => {
    expect(() => new SeededRng(1).pick([])).toThrow();
  });
});
