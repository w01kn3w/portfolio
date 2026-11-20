import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createApp } from "../server/app.ts";
import { fallbackDocument } from "../src/portfolio-data.ts";
const options = { origin: "http://127.0.0.1", staticDirectory: "dist" };
const server = createApp(options);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
options.origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(
  process.platform === "win32" ? { channel: "chrome" } : {},
);
const results = [];
const publication = structuredClone(fallbackDocument);
const workflowEntry = publication.entries.find(
  (entry) => entry.kind === "PROCESS",
);
publication.entries = publication.entries.filter(
  (entry) => entry.kind !== "PROCESS",
);
publication.entries.push(
  ...workflowEntry.content.items.map((item, index) => ({
    id: `step-${index}`,
    kind: "PROCESS",
    slug: `step-${index}`,
    sortOrder: index,
    content: item,
  })),
);
publication.entries.push({
  id: "main-navigation",
  kind: "NAVIGATION",
  slug: "main",
  sortOrder: 0,
  content: {
    title: { en: "Main navigation" },
    items: ["services", "projects", "about", "contact"].map((id) => ({
      title: { en: id[0].toUpperCase() + id.slice(1) },
      url: `#${id}`,
    })),
  },
});
publication.entries.find(
  (entry) => entry.kind === "SERVICE",
).content.startingPriceMinor = 500;
publication.entries.find(
  (entry) => entry.kind === "SERVICE",
).content.priceCurrency = "XTR";
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.addInitScript(() => {
    window.__portfolioVitals = { lcp: null, cls: 0 };
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      window.__portfolioVitals.lcp = entries.at(-1)?.startTime || null;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__portfolioVitals.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  let mode = "published",
    inquiryStatus = 500;
  const submissions = [];
  const errors = [];
  await context.route(
    "https://labs.atajan.org/api/v1/portfolio/**",
    async (route) => {
      const request = route.request(),
        headers = {
          "Access-Control-Allow-Origin": options.origin,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Content-Type": "application/json",
        };
      if (request.method() === "OPTIONS")
        return route.fulfill({ status: 204, headers, body: "" });
      if (request.url().endsWith("/content"))
        return route.fulfill({
          status: mode === "failure" ? 503 : 200,
          headers,
          body: JSON.stringify(
            mode === "empty" ? { version: "empty", entries: [] } : publication,
          ),
        });
      if (request.url().endsWith("/inquiries")) {
        submissions.push(request.postDataJSON());
        return route.fulfill({
          status: inquiryStatus,
          headers,
          body: JSON.stringify(
            inquiryStatus === 201
              ? { success: true }
              : { message: "Unavailable" },
          ),
        });
      }
      return route.fulfill({ status: 404, headers, body: "{}" });
    },
  );
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(options.origin, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const initialPerformance = await page.evaluate(() => ({
    ...window.__portfolioVitals,
    domContentLoaded:
      performance.getEntriesByType("navigation")[0]?.domContentLoadedEventEnd,
    resources: performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      transferSize: entry.transferSize,
      duration: Math.round(entry.duration),
    })),
  }));
  assert.match(await page.title(), /Atajan Labs/);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator(".service").count(), 5);
  assert.equal(await page.locator(".project").count(), 1);
  assert.equal(await page.locator(".technology-list img").count(), 11);
  assert.equal(await page.locator(".process-list li").count(), 7);
  assert.match(await page.locator(".service").first().innerText(), /500/);
  assert.doesNotMatch(
    await page.locator(".service").first().innerText(),
    /5\.00/,
  );
  assert.equal(await page.locator(".primary-nav a").count(), 4);
  assert.equal(
    await page
      .locator(
        '.contact-copy .contact-links a[href="mailto:wolkannaberdiyew@gmail.com"]',
      )
      .count(),
    1,
  );
  assert.equal(
    await page
      .locator(
        '.contact-copy .contact-links a[href="https://github.com/w01kn3w"]',
      )
      .count(),
    1,
  );
  results.push(
    "Published document renders all portfolio sections and verified contacts",
  );
  assert.equal(await page.locator('a[href^="tel:"]').count(), 0);
  assert.doesNotMatch(await page.locator("body").innerText(), /8613521004012/);
  const whatsapp = page.locator('.contact-copy a[href^="https://wa.me/"]');
  assert.equal(
    new URL(await whatsapp.getAttribute("href")).pathname,
    "/8613521004012",
  );
  assert.equal(
    await whatsapp.getAttribute("aria-label"),
    "Contact me on WhatsApp",
  );
  assert.equal(await whatsapp.getAttribute("rel"), "noopener noreferrer");
  assert.equal(await page.locator(".contact-links svg").count(), 10);
  results.push(
    "Icon contacts, exact WhatsApp destination and no visible phone number",
  );
  await page.locator(".language-control select").selectOption("ru");
  assert.equal(await page.locator("html").getAttribute("lang"), "ru");
  assert.match(await page.locator("h1").innerText(), /Цифровые/);
  assert.match(
    await page.locator(".orbit-caption").innerText(),
    /Геометрический этюд/,
  );
  assert.doesNotMatch(await page.locator("body").innerText(), /\?{3}/);
  assert.match(await page.locator("#inquiry-name").getAttribute("id"), /name/);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("lang"), "ru");
  await page.locator(".language-control select").selectOption("en");
  results.push("English/Russian language selection persists across reload");
  await page.locator(".project-filters button").last().click();
  assert.equal(await page.locator(".project").count(), 1);
  await page.locator('.project-cover[href="/projects/atajan-portfolio/"]').click();
  assert.match(page.url(), /\/projects\/atajan-portfolio\//);
  assert.match(await page.locator("main h1").innerText(), /Atajan portfolio/);
  assert.equal(
    await page
      .locator('a[href="https://github.com/w01kn3w/portfolio"]')
      .count(),
    1,
  );
  assert.equal(
    await page.locator(".footer-bottom a").last().getAttribute("href"),
    "/#top",
  );
  await page.locator(".footer-bottom a").first().click();
  assert.match(page.url(), /\/legal\/privacy\//);
  assert.match(await page.locator("main h1").innerText(), /Privacy/);
  assert.equal(await page.title(), "Privacy");
  await page.locator("main>a").first().click();
  assert.equal(new URL(page.url()).pathname, "/");
  await page.locator('.project-cover[href="/projects/atajan-portfolio/"]').click();
  await page.locator("main>a").first().click();
  await page.locator("#projects").waitFor();
  results.push("Project category filtering, detail route and source evidence");
  await page.locator("#inquiry-name").fill("Browser Test");
  await page.locator("#inquiry-email").fill("browser@example.test");
  await page
    .locator("#inquiry-message")
    .fill("A verification-only inquiry with no real delivery.");
  await page.locator(".inquiry-form button[type=submit]").click();
  await page
    .getByText("The server did not confirm your inquiry.", { exact: false })
    .waitFor();
  const draft = new URL(
    await page
      .getByRole("link", { name: "Open email draft" })
      .getAttribute("href"),
  );
  assert.match(draft.searchParams.get("body"), /verification-only inquiry/);
  assert.match(draft.searchParams.get("body"), /browser@example.test/);
  inquiryStatus = 201;
  await page.locator(".inquiry-form button[type=submit]").click();
  await page
    .getByText("Your inquiry has been saved.", { exact: false })
    .waitFor();
  assert.equal(submissions.length, 2);
  assert.equal(submissions[0].submissionId, submissions[1].submissionId);
  assert.equal(await page.locator("#inquiry-name").inputValue(), "");
  results.push(
    "Inquiry failure is explicit; retry preserves idempotency key; confirmed response resets form",
  );
  inquiryStatus = 500;
  await page.locator("#inquiry-name").fill("Changed request");
  await page.locator("#inquiry-email").fill("browser@example.test");
  await page
    .locator("#inquiry-message")
    .fill("First version of a new project inquiry.");
  await page.locator(".inquiry-form button[type=submit]").click();
  await page
    .getByText("The server did not confirm your inquiry.", { exact: false })
    .waitFor();
  await page
    .locator("#inquiry-message")
    .fill("An edited version of this project inquiry.");
  await page.locator(".inquiry-form button[type=submit]").click();
  await page.waitForFunction(
    () =>
      document.querySelector(".inquiry-form button[type=submit]")?.disabled ===
      false,
  );
  assert.equal(submissions.length, 4);
  assert.notEqual(submissions[2].submissionId, submissions[3].submissionId);
  results.push(
    "Edited failed inquiry uses a new identifier instead of becoming stuck on409",
  );
  delete publication.entries.find((entry) => entry.kind === "SERVICE").content
    .startingPriceMinor;
  delete publication.entries.find((entry) => entry.kind === "SERVICE").content
    .priceCurrency;
  await page.goto(options.origin, { waitUntil: "networkidle" });
  await page.locator(".technology-list").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".technology-list img")].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  await page.evaluate(async () => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await mkdir(".impeccable/review", { recursive: true });
  await page.screenshot({
    path: ".impeccable/review/desktop-upgrade.png",
    fullPage: true,
  });
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `horizontal overflow at ${width}`,
    );
    if (width < 560) {
      await page.locator(".menu-toggle").click();
      assert.equal(await page.locator(".primary-nav").isVisible(), true);
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
      assert.equal(
        await page
          .locator(".menu-toggle")
          .evaluate((element) => element === document.activeElement),
        true,
      );
      await page.locator(".menu-toggle").click();
      await page.locator(".primary-nav a").first().click();
      assert.equal(await page.locator(".primary-nav").isVisible(), false);
    }
    if (width === 390)
      await page.evaluate(async () => {
        document.activeElement?.blur();
        window.scrollTo(0, 0);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
      });
    if (width === 390)
      await page.screenshot({
        path: ".impeccable/review/mobile-upgrade.png",
        fullPage: true,
      });
  }
  results.push(
    "320/375/390/430/768/1024/1280/1440/1920 responsive layout and mobile navigation",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  const canvas = page.locator(".orbit canvas");
  const before = await canvas.evaluate((e) => e.toDataURL());
  await page.waitForTimeout(150);
  const after = await canvas.evaluate((e) => e.toDataURL());
  assert.equal(before, after);
  await page.locator(".orbit-caption button").click();
  assert.equal(
    await page.locator(".orbit-caption button").getAttribute("aria-pressed"),
    "true",
  );
  results.push(
    "Original Canvas artwork retains pause control and reduced-motion behavior",
  );
  await page.evaluate(
    await readFile("node_modules/axe-core/axe.min.js", "utf8"),
  );
  const accessibility = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    }));
  });
  assert.equal(accessibility.length, 0, JSON.stringify(accessibility));
  results.push("axe WCAG2 A/AA and WCAG2.1 AA audit: zero violations");
  await page.goto(`${options.origin}/#/projects/not-published`, {
    waitUntil: "networkidle",
  });
  assert.match(await page.locator("main h1").innerText(), /could not be found/);
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute("content"),
    "noindex, nofollow",
  );
  await page.goto(`${options.origin}/#/projects/%`, {
    waitUntil: "networkidle",
  });
  assert.match(await page.locator("main h1").innerText(), /could not be found/);
  const staticProject = await readFile(
    "dist/projects/atajan-portfolio/index.html",
    "utf8",
  );
  assert.match(staticProject, /<title>Atajan portfolio<\/title>/);
  assert.match(
    staticProject,
    /https:\/\/atajan.org\/projects\/atajan-portfolio\//,
  );
  assert.match(staticProject, /<noscript><main><h1>Atajan portfolio<\/h1>/);
  assert.match(
    staticProject,
    /name="twitter:title" content="Atajan portfolio"/,
  );
  const homeHtml = await readFile("dist/index.html", "utf8");
  assert.match(homeHtml, /id="portfolio-snapshot"/);
  assert.doesNotMatch(homeHtml, /8613521004012|"phone"\s*:/);
  assert.match(
    await readFile("dist/sitemap.xml", "utf8"),
    /\/projects\/atajan-portfolio\//,
  );
  results.push(
    "Prerendered project metadata, canonical, crawler content and sitemap",
  );
  await page.goto(`${options.origin}/missing-page`, {
    waitUntil: "networkidle",
  });
  assert.match(await page.locator("main h1").innerText(), /could not be found/);
  results.push("Unpublished project and unknown page render custom 404");
  mode = "empty";
  await page.goto(options.origin, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".service").count(), 0);
  assert.equal(await page.locator(".project").count(), 0);
  mode = "failure";
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator(".service").count(), 5);
  await page.locator(".content-fallback").waitFor();
  results.push(
    "Empty publication never merges fallback; API failure shows explicit verified snapshot",
  );
  mode = "published";
  const admin = await context.newPage();
  await admin.route("https://labs.atajan.org/", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Preview sender fixture</title>",
    }),
  );
  await admin.goto("https://labs.atajan.org/");
  const popupPromise = admin.waitForEvent("popup");
  await admin.evaluate(
    (url) => window.open(url, "_blank"),
    `${options.origin}/?preview=1`,
  );
  const popup = await popupPromise;
  await popup.waitForLoadState("networkidle");
  const previewDoc = structuredClone(fallbackDocument);
  previewDoc.entries.find((e) => e.kind === "HERO").content.title.en =
    "Private preview title";
  previewDoc.entries.find(
    (entry) => entry.kind === "HERO",
  ).content.imageMediaId = "draft-only-image";
  await popup.evaluate(
    (doc) =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://attacker.invalid",
          source: window.opener,
          data: { type: "atajan:portfolio-preview", document: doc },
        }),
      ),
    previewDoc,
  );
  assert.notEqual(
    await popup.locator("h1").innerText(),
    "Private preview title",
  ); // The real opener references its child through the named window handle.
  await popup.evaluate(() =>
    window.opener.postMessage(
      { type: "test-preview-request" },
      "https://labs.atajan.org",
    ),
  );
  await admin.evaluate(
    ({ doc, origin }) => {
      window.addEventListener(
        "message",
        async (event) => {
          if (
            event.origin === origin &&
            event.data?.type === "test-preview-request"
          ) {
            const canvas = document.createElement("canvas");
            canvas.width = 8;
            canvas.height = 8;
            canvas.getContext("2d").fillRect(0, 0, 8, 8);
            const blob = await new Promise((resolve) =>
              canvas.toBlob(resolve, "image/png"),
            );
            event.source.postMessage(
              {
                type: "atajan:portfolio-preview",
                document: doc,
                media: [{ id: "draft-only-image", blob }],
              },
              origin,
            );
          }
        },
        { once: true },
      );
    },
    { doc: previewDoc, origin: options.origin },
  );
  await popup.evaluate(() =>
    window.opener.postMessage(
      { type: "test-preview-request" },
      "https://labs.atajan.org",
    ),
  );
  await popup
    .getByRole("heading", { name: "Private preview title", exact: true })
    .waitFor();
  await popup.locator(".preview-notice").waitFor();
  await popup.waitForFunction(
    () => document.querySelector(".hero-art img")?.naturalWidth === 8,
  );
  assert.match(
    await popup.locator(".hero-art img").getAttribute("src"),
    /^blob:/,
  );
  await popup.close();
  await admin.close();
  results.push(
    "Preview accepts only exact trusted opener origin and requires no credential transport",
  );
  publication.entries.push({
    id: "design-test",
    kind: "DESIGN",
    slug: "design",
    sortOrder: 0,
    content: {
      title: { en: "Design" },
      defaultLanguage: "ru",
      availableLanguages: ["ru", "en"],
    },
  });
  await page.evaluate(() => localStorage.removeItem("atajan-language"));
  await page.goto(options.origin, { waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("lang"), "ru");
  publication.entries.find(
    (entry) => entry.kind === "DESIGN",
  ).content.availableLanguages = ["en"];
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(await page.locator(".language-control option").count(), 1);
  results.push(
    "CMS default language applies on first visit and available languages are enforced",
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  const metrics = await page.evaluate(() => ({
    resources: performance.getEntriesByType("resource").map((r) => ({
      name: r.name,
      transferSize: r.transferSize,
      duration: Math.round(r.duration),
    })),
  }));
  await writeFile(
    ".impeccable/review/browser-upgrade.json",
    JSON.stringify(
      { results, accessibility, initialPerformance, metrics, errors },
      null,
      2,
    ),
  );
  console.log(results.map((x) => `PASS ${x}`).join("\n"));
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
