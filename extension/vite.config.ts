import {
  copyFileSync,
  existsSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(root, "src/background/service-worker.ts"),
        popup: resolve(root, "src/popup/popup.html"),
        options: resolve(root, "src/options/options.html"),
      },
      output: {
        format: "es",
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "background" ? "background.js" : "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const n = assetInfo.names?.[0] ?? "";
          if (typeof n === "string" && n.endsWith(".html")) {
            return "[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [
    {
      name: "copy-manifest",
      closeBundle() {
        copyFileSync(resolve(root, "manifest.json"), resolve(root, "dist/manifest.json"));
      },
    },
    {
      name: "flatten-popup-options-html",
      closeBundle() {
        const dist = resolve(root, "dist");
        const moves: Array<{ from: string; to: string }> = [
          { from: resolve(dist, "src/popup/popup.html"), to: resolve(dist, "popup.html") },
          { from: resolve(dist, "src/options/options.html"), to: resolve(dist, "options.html") },
        ];
        for (const { from, to } of moves) {
          if (!existsSync(from)) continue;
          let html = readFileSync(from, "utf8");
          html = html.replace(/\.\.\/\.\.\/assets\//g, "./assets/");
          html = html.replace(/\.\.\/assets\//g, "./assets/");
          html = html.replace(/src="\/assets\//g, 'src="./assets/');
          html = html.replace(/href="\/assets\//g, 'href="./assets/');
          writeFileSync(to, html);
          unlinkSync(from);
        }
        const srcDir = resolve(dist, "src");
        if (existsSync(srcDir)) {
          rmSync(srcDir, { recursive: true, force: true });
        }
      },
    },
  ],
});
