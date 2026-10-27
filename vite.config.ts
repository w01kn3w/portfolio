import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  copyFileSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";

function compressDirectory(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) compressDirectory(path);
    else if (/\.(html|css|js|svg|xml|txt)$/.test(path)) {
      const source = readFileSync(path);
      writeFileSync(
        `${path}.br`,
        brotliCompressSync(source, {
          params: { [constants.BROTLI_PARAM_QUALITY]: 6 },
        }),
      );
      writeFileSync(`${path}.gz`, gzipSync(source));
    }
  }
}
export default defineConfig({
  plugins: [
    react(),
    {
      name: "static-not-found-page",
      closeBundle() {
        copyFileSync("dist/index.html", "dist/404.html");
        compressDirectory("dist");
      },
    },
  ],
  base: process.env.VITE_BASE_PATH || "/",
  server: { proxy: { "/api": "http://127.0.0.1:3000" } },
});
