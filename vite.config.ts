import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const PROJECT_ROOT_DIRECTORY = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        workspace: resolve(PROJECT_ROOT_DIRECTORY, "workspace.html"),
        sidepanel: resolve(PROJECT_ROOT_DIRECTORY, "sidepanel.html"),
        serviceWorker: resolve(PROJECT_ROOT_DIRECTORY, "src/background/service-worker.ts")
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "serviceWorker"
            ? "assets/[name].js"
            : "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
