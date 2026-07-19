import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const PROJECT_ROOT_DIRECTORY = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(PROJECT_ROOT_DIRECTORY, "src/content/bootstrap.ts"),
      name: "CouncilContentScript",
      formats: ["iife"],
      fileName: () => "assets/contentScript.js"
    },
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});
