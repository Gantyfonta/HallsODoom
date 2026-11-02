import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths so the built game works from any static host or sub-folder.
  base: "./",
  build: {
    // Phaser is large; put it in its own file so game code changes stay small.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/phaser")) return "phaser";
          return undefined;
        },
      },
    },
  },
});
