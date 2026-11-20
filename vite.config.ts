import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
  // Carry the published snapshot into the first render and offline fallback.
  // Legacy CMS phone fields are deliberately excluded from generated HTML.
  const snapshot = JSON.stringify(document, (key, value: unknown) =>
    key === "phone" ? undefined : value,
  ).replace(/</g, "\\u003c");
  let template = readFileSync("dist/index.html", "utf8").replace(
    '<div id="root"></div>',
    `<div id="root"></div><script id="portfolio-snapshot" type="application/json">${snapshot}</script>`,
  );
  const api = (
    process.env.VITE_PORTFOLIO_API_URL || "https://labs.atajan.org/api/v1"
  ).replace(/\/$/, "");
  const urls = ["https://atajan.org/"];
  function page(path: string, content: PortfolioContent, home = false) {
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
    for (const [name, value] of Object.entries({
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
    }))
      html = html.replace(
        new RegExp(`<meta\\s+name="${name}"[^>]*>`),
        `<meta name="${name}" content="${escapeHtml(value)}" />`,
      );
    html = html.replace(
      /<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/,
      `<noscript><main><h1>${escapeHtml(content.title.en)}</h1><p>${escapeHtml(description)}</p><p>${escapeHtml(content.body?.en || "")}</p>${content.challenge ? `<h2>The challenge</h2><p>${escapeHtml(content.challenge.en)}</p>` : ""}${content.solution ? `<h2>The solution</h2><p>${escapeHtml(content.solution.en)}</p>` : ""}${
        home
          ? document.entries
              .filter(
                (e) =>
                  e.content.active !== false &&
                  ["SERVICE", "PROJECT", "ABOUT"].includes(e.kind),
              )
              .map(
                (e) =>
                  `<section><h2>${escapeHtml(e.content.title.en)}</h2><p>${escapeHtml(e.content.description?.en || "")}</p>${e.kind === "PROJECT" ? `<a href="/projects/${escapeHtml(e.slug)}/">Explore project</a>` : ""}</section>`,
              )
              .join("") +
            '<a href="mailto:wolkannaberdiyew@gmail.com">Send an email</a>'
          : ""
      }<a href="/">Atajan Labs</a></main></noscript>`,
    );
    const directory = join("dist", path);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "index.html"), html);
    if (home) template = html;
    else urls.push(canonical);
  }
  const seo = document.entries.find(
    (e) => e.kind === "SEO" && e.content.active !== false,
  )?.content;
  page(
    "/",
    seo || {
      title: { en: "Atajan Labs | Web development, backend & automation" },
      description: {
        en: "Websites, backend systems and automation by Atajan, an independent full-stack developer.",
      },
    },
    true,
  );
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
        body: {
          en:
            slug === "privacy"
              ? "The inquiry form collects your name, email and project message so Atajan Labs can respond. Confirmed API submissions are stored in the private administration system. Email drafts are sent only through your own mail app. Please do not include passwords, payment details or other secrets. Contact us by email to request access, correction or deletion."
              : "This website presents development services and project evidence. A project begins only after scope, pricing, delivery and support terms have been agreed separately. This website does not accept payments. No agreement or payment is created by submitting an inquiry.",
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
        writeFileSync(
          "dist/404.html",
          readFileSync("dist/index.html", "utf8").replace(
            'name="robots" content="index, follow"',
            'name="robots" content="noindex, nofollow"',
          ),
        );
        compressDirectory("dist");
      },
    },
  ],
  base: process.env.VITE_BASE_PATH || "/",
  server: { proxy: { "/api": "http://127.0.0.1:3000" } },
});
