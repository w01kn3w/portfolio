import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  copyFileSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { join } from "node:path";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";
import { fallbackDocument } from "./src/portfolio-data";
import type {
  PortfolioDocument,
  PortfolioContent,
} from "./src/portfolio-types";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
function generateStaticPages() {
  let document: PortfolioDocument = fallbackDocument;
  // Only an explicit published, read-only export is accepted. No authenticated CMS API is used by the build.
  if (process.env.PORTFOLIO_BUILD_CONTENT_FILE) {
    const value = JSON.parse(
      readFileSync(process.env.PORTFOLIO_BUILD_CONTENT_FILE, "utf8"),
    ) as PortfolioDocument;
    if (
      typeof value.version !== "string" ||
      !Array.isArray(value.entries) ||
      value.entries.some(
        (entry) => typeof entry?.content?.title?.en !== "string",
      )
    )
      throw new Error("Invalid published build content");
    document = value;
  }
  const template = readFileSync("dist/index.html", "utf8");
  const api = (
    process.env.VITE_PORTFOLIO_API_URL || "https://labs.atajan.org/api/v1"
  ).replace(/\/$/, "");
  const urls = ["https://atajan.org/"];
  function page(path: string, content: PortfolioContent) {
    const canonical = `https://atajan.org${path}`;
    const title = content.seoTitle?.en || content.title.en;
    const description =
      content.seoDescription?.en || content.description?.en || "";
    const image = content.ogMediaId
      ? `${api}/portfolio/media/${encodeURIComponent(content.ogMediaId)}`
      : "https://atajan.org/social-card.png";
    const meta = (property: string, value: string) =>
      `<meta property="${property}" content="${escapeHtml(value)}" />`;
    let html = template
      .replace(
        /<title>[\s\S]*?<\/title>/,
        `<title>${escapeHtml(title)}</title>`,
      )
      .replace(
        /<meta\s+name="description"[^>]*>/,
        `<meta name="description" content="${escapeHtml(description)}" />`,
      )
      .replace(
        /<link\s+rel="canonical"[^>]*>/,
        `<link rel="canonical" href="${canonical}" />`,
      );
    for (const [property, value] of Object.entries({
      "og:title": title,
      "og:description": description,
      "og:url": canonical,
      "og:image": image,
    }))
      html = html.replace(
        new RegExp(`<meta\\s+property="${property}"[^>]*>`),
        meta(property, value),
      );
    html = html.replace(
      /<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/,
      `<noscript><main><h1>${escapeHtml(content.title.en)}</h1><p>${escapeHtml(description)}</p><p>${escapeHtml(content.body?.en || "")}</p>${content.challenge ? `<h2>The challenge</h2><p>${escapeHtml(content.challenge.en)}</p>` : ""}${content.solution ? `<h2>The solution</h2><p>${escapeHtml(content.solution.en)}</p>` : ""}<a href="/">Atajan Labs</a></main></noscript>`,
    );
    const directory = join("dist", path);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "index.html"), html);
    urls.push(canonical);
  }
  for (const entry of document.entries.filter(
    (entry) =>
      entry.content.active !== false &&
      ["PROJECT", "LEGAL"].includes(entry.kind),
  )) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug))
      throw new Error("Unsafe published slug");
    page(
      `/${entry.kind === "PROJECT" ? "projects" : "legal"}/${entry.slug}/`,
      entry.content,
    );
  }
  for (const slug of ["privacy", "terms"])
    if (
      !document.entries.some(
        (entry) =>
          entry.kind === "LEGAL" &&
          entry.slug === slug &&
          entry.content.active !== false,
      )
    )
      page(`/legal/${slug}/`, {
        title: { en: slug === "privacy" ? "Privacy" : "Terms" },
        description: {
          en:
            slug === "privacy"
              ? "How Atajan Labs uses your project inquiry information."
              : "Projects begin after scope, pricing and delivery terms are agreed separately.",
        },
      });
  writeFileSync(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join("")}</urlset>`,
  );
  writeFileSync(
    "dist/content-version.json",
    JSON.stringify({
      version: document.version,
      generatedAt: new Date().toISOString(),
      source: process.env.PORTFOLIO_BUILD_CONTENT_FILE
        ? "explicit-published-export"
        : "verified-bundled-snapshot",
    }),
  );
}

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
        generateStaticPages();
        copyFileSync("dist/index.html", "dist/404.html");
        compressDirectory("dist");
      },
    },
  ],
  base: process.env.VITE_BASE_PATH || "/",
  server: { proxy: { "/api": "http://127.0.0.1:3000" } },
});
