import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createApp } from "../server/app.ts";

const options = { origin: "http://127.0.0.1", staticDirectory: "dist" };
const server = createApp(options);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
options.origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(
  process.platform === "win32" ? { channel: "chrome" } : {},
);
const results = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  const brokenResponses = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      !response.url().includes("/api/contact") &&
      !response.url().includes("/missing-page")
    )
      brokenResponses.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(options.origin, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.match(await page.title(), /Atajan/);
  await mkdir(".impeccable/review", { recursive: true });
  await page.screenshot({
    path: ".impeccable/review/desktop.png",
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `overflow at ${width}px`,
    );
    if (width === 390)
      await page.screenshot({
        path: ".impeccable/review/mobile.png",
        fullPage: true,
      });
  }
  results.push(
    "Desktop/mobile layout: no horizontal overflow at 320, 390, 768, 1440px",
  );
  await page.locator(".project-art").click();
  assert.equal(await page.locator("#case-study").getAttribute("open"), "");
  await page.getByRole("button", { name: "Database", exact: true }).click();
  assert.match(
    await page.locator(".architecture-detail").innerText(),
    /no database here/,
  );
  await page.getByRole("tab", { name: "Build" }).click();
  await page.getByRole("tab", { name: "Build" }).press("ArrowRight");
  assert.match(
    await page.getByRole("tabpanel").innerText(),
    /Check the real behaviour/,
  );
  await page.getByRole("button", { name: "Backend", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Backend", exact: true })
      .getAttribute("aria-expanded"),
    "true",
  );
  results.push(
    "Case study, architecture, keyboard process navigation and technology explorer",
  );
  if (process.argv.includes("--no-contact")) {
    await page.getByText("Contact details are being set up.").waitFor();
    assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
    assert.equal(await page.locator(".contact-form").count(), 0);
    results.push("Unavailable contact hides the uncreated mailbox and form");
  } else {
    await page
      .getByLabel("Your name", { exact: true })
      .fill("Browser verification");
    await page
      .getByLabel("Email address", { exact: true })
      .fill("test@example.com");
    await page
      .getByLabel("What are you working on?")
      .fill("Checking the real unavailable SMTP state in a local test.");
    if (process.argv.includes("--email")) {
      const apiRequests = [];
      page.on("request", (request) => {
        if (request.url().endsWith("/api/contact"))
          apiRequests.push(request.url());
      });
      await page.getByRole("button", { name: "Create email draft" }).click();
      await page
        .getByText(
          "Complete sending in your email app. If no draft appears, use the email link.",
        )
        .waitFor();
      assert.deepEqual(apiRequests, []);
      assert.equal(
        await page.getByText("Message sent.", { exact: false }).count(),
        0,
      );
      results.push(
        "Static contact creates an email draft without API calls or false delivery confirmation",
      );
    } else {
      const submission = page.waitForResponse((response) =>
        response.url().endsWith("/api/contact"),
      );
      await page.getByRole("button", { name: "Send enquiry" }).click();
      assert.equal((await submission).status(), 503);
      await page
        .getByText(
          "Message delivery is not available right now. Please use the email link.",
        )
        .waitFor();
      await page.route("**/api/contact", (route) => route.abort());
      await page.getByRole("button", { name: "Send enquiry" }).click();
      await page
        .getByText(
          "The server did not confirm delivery. Please use the email link or try again later.",
        )
        .waitFor();
      assert.equal(
        await page.getByText("Message sent.", { exact: false }).count(),
        0,
      );
      results.push(
        "Real unconfigured contact API returns 503; network failure is actionable; no false success",
      );
      await page.unroute("**/api/contact");
    }
  }
  await page.mouse.move(300, 300);
  assert.equal(
    await page
      .locator(".cursor-ring")
      .evaluate((element) => getComputedStyle(element).display),
    "grid",
  );
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Play", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".cursor-system")
      .evaluate((element) => getComputedStyle(element).display),
    "none",
  );
  results.push("Desktop cursor, animation pause and reduced-motion fallback");
  await page.goto(options.origin);
  const axe = await readFile(
    new URL("../node_modules/axe-core/axe.min.js", import.meta.url),
    "utf8",
  );
  await page.evaluate(axe);
  const accessibility = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
    });
    return result.violations.map((item) => ({
      id: item.id,
      impact: item.impact,
      nodes: item.nodes.length,
    }));
  });
  assert.deepEqual(accessibility, []);
  results.push("axe WCAG A/AA: zero automated violations");
  const notFound = await page.goto(`${options.origin}/missing-page`);
  assert.equal(notFound.status(), 404);
  await page.getByRole("heading", { name: /A wrong turn/ }).waitFor();
  await page.getByRole("link", { name: "Back to the portfolio" }).click();
  await page.getByRole("heading", { level: 1 }).waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(brokenResponses, []);
  results.push(
    "Designed HTTP 404, return link, assets and no JavaScript errors",
  );
  const touch = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const mobile = await touch.newPage();
  await mobile.goto(options.origin);
  assert.equal(
    await mobile
      .locator(".cursor-system")
      .evaluate((element) => getComputedStyle(element).display),
    "none",
  );
  await touch.close();
  results.push("Touch input preserves the system pointer");
  await writeFile(
    ".impeccable/review/browser-results.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        results,
        accessibility,
        errors,
        brokenResponses,
      },
      null,
      2,
    ),
  );
  console.log(results.join("\n"));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
