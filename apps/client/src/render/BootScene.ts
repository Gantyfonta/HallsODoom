import Phaser from "phaser";
import { SeededRng, SAVE_FORMAT_VERSION } from "@hollow-crown/core";

/**
 * Placeholder first scene. It proves three things work:
 *   1. Phaser draws to the screen.
 *   2. The client can import the core package.
 *   3. Core code (the seeded RNG) runs in the browser.
 * It will be replaced by the real game scene in the next roadmap step.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 20, "HOLLOW CROWN", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        color: "#c9a85c",
      })
      .setOrigin(0.5);

    // Same seed always gives the same number: a quick visual check that core works.
    const rng = new SeededRng(1337);
    this.add
      .text(
        width / 2,
        height / 2 + 40,
        `foundation online | seed 1337 -> ${rng.int(1, 100)} | save format v${SAVE_FORMAT_VERSION}`,
        { fontFamily: "monospace", fontSize: "16px", color: "#8a8795" },
      )
      .setOrigin(0.5);
  }
}
