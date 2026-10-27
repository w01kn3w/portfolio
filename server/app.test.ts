import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp, smtpSender, validateContact } from "./app.ts";
import type { ContactMessage } from "./app.ts";
import { brotliCompressSync } from "node:zlib";

const origin = "https://atajan.org";
const valid = {
  name: "Test Visitor",
  email: "visitor@example.com",
  message: "I would like to discuss a new website.",
  website: "",
};
async function run(
  options: Parameters<typeof createApp>[0],
  callback: (url: string) => Promise<void>,
) {
  const server = createApp(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
const post = (url: string, payload: unknown = valid, requestOrigin = origin) =>
  fetch(url + "/api/contact", {
    method: "POST",
    headers: { Origin: requestOrigin, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

test("validation rejects injection, spam, missing fields and unknown keys", () => {
  assert.ok(validateContact(valid));
  for (const value of [
    null,
    [],
    {},
    { ...valid, name: "x\r\nBcc: bad" },
    { ...valid, email: "a@b.com\r\n" + "Bcc:bad" },
    { ...valid, message: "short" },
    { ...valid, website: "spam" },
    { ...valid, secret: "no" },
  ])
    assert.equal(validateContact(value), null);
  assert.equal(smtpSender({}), undefined);
});
test("unconfigured mail reports 503 honestly and health exposes configuration", async () => {
  await run({ origin }, async (url) => {
    const health = await fetch(url + "/api/health");
    assert.deepEqual(await health.json(), {
      status: "ok",
      contactConfigured: false,
    });
    assert.equal(health.headers.get("cache-control"), "no-store");
    assert.equal((await post(url)).status, 503);
    assert.equal((await post(url, valid, "https://evil.example")).status, 403);
    assert.equal((await fetch(url + "/api/contact")).status, 405);
  });
});
test("mail is awaited, failure never returns success, and validation precedes sending", async () => {
  const sent: ContactMessage[] = [];
  await run(
    {
      origin,
      send: async (message) => {
        sent.push(message);
      },
    },
    async (url) => {
      assert.equal((await post(url, { ...valid, website: "bot" })).status, 400);
      assert.equal(sent.length, 0);
      assert.equal((await post(url)).status, 200);
      assert.deepEqual(sent, [
        { name: valid.name, email: valid.email, message: valid.message },
      ]);
    },
  );
  await run(
    {
      origin,
      send: async () => {
        throw new Error("Private SMTP failure");
      },
    },
    async (url) => {
      const result = await post(url);
      assert.equal(result.status, 502);
      assert.ok(!(await result.text()).includes("Private SMTP"));
    },
  );
});
test("rate limiting ignores spoofed proxy headers by default", async () => {
  await run({ origin, maxRequests: 1 }, async (url) => {
    assert.equal((await post(url)).status, 503);
    const response = await fetch(url + "/api/contact", {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "X-Real-IP": "192.0.2.123",
      },
      body: JSON.stringify(valid),
    });
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get("retry-after")) > 0);
  });
});
test("bad JSON and unsupported media types receive actionable errors", async () => {
  await run({ origin }, async (url) => {
    assert.equal(
      (
        await fetch(url + "/api/contact", {
          method: "POST",
          headers: { Origin: origin, "Content-Type": "application/json" },
          body: "{",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(url + "/api/contact", {
          method: "POST",
          headers: { Origin: origin },
          body: "plain",
        })
      ).status,
      415,
    );
    assert.equal(
      (await post(url, { ...valid, message: "x".repeat(20_000) })).status,
      413,
    );
  });
});
test("static content uses cache and security headers and unknown paths return 404", async () => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-test-"));
  try {
    await writeFile(join(directory, "index.html"), "<h1>Atajan</h1>");
    await writeFile(
      join(directory, "index.html.br"),
      brotliCompressSync("<h1>Atajan</h1>"),
    );
    await run({ origin, staticDirectory: directory }, async (url) => {
      const home = await fetch(url);
      assert.equal(home.status, 200);
      const compressed = await fetch(url, {
        headers: { "Accept-Encoding": "br" },
      });
      assert.equal(compressed.headers.get("content-encoding"), "br");
      assert.equal(compressed.headers.get("vary"), "Accept-Encoding");
      assert.equal(await compressed.text(), "<h1>Atajan</h1>");
      const uncompressed = await fetch(url, {
        headers: { "Accept-Encoding": "br;q=0" },
      });
      assert.equal(uncompressed.headers.get("content-encoding"), null);
      assert.equal(await uncompressed.text(), "<h1>Atajan</h1>");
      assert.equal(home.headers.get("x-content-type-options"), "nosniff");
      assert.ok(
        home.headers
          .get("content-security-policy")
          ?.includes("frame-ancestors 'none'"),
      );
      assert.equal((await fetch(url + "/missing")).status, 404);
      assert.equal((await fetch(url + "/api/missing")).status, 404);
      assert.equal((await fetch(url + "/%2e%2e%2fpackage.json")).status, 404);
    });
  } finally {
    await rm(directory, { recursive: true });
  }
});
