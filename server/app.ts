import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import nodemailer from "nodemailer";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}
interface Options {
  origin: string;
  send?: (message: ContactMessage) => Promise<void>;
  staticDirectory?: string;
  trustProxy?: boolean;
  maxRequests?: number;
}
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".ico": "image/x-icon",
};
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};
function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}
export function validateContact(input: unknown): ContactMessage | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const fields = input as Record<string, unknown>;
  if (
    Object.keys(fields).some(
      (key) => !["name", "email", "message", "website"].includes(key),
    )
  )
    return null;
  if (
    typeof fields.name !== "string" ||
    typeof fields.email !== "string" ||
    typeof fields.message !== "string"
  )
    return null;
  if (
    fields.website !== undefined &&
    (typeof fields.website !== "string" || fields.website !== "")
  )
    return null;
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  if (
    name.length < 2 ||
    name.length > 100 ||
    [...name].some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  )
    return null;
  if (email.length > 254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email))
    return null;
  if (
    message.length < 20 ||
    message.length > 5000 ||
    [...message].some((character) => {
      const code = character.charCodeAt(0);
      return (code < 32 && ![9, 10, 13].includes(code)) || code === 127;
    })
  )
    return null;
  return { name, email, message };
}
function body(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 16_384) {
        reject(new Error("BODY_LIMIT"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (size > 16_384) return;
      try {
        resolveBody(
          JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown,
        );
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}
export function createApp(options: Options) {
  // One process, fixed ten-minute windows. Use a shared limiter before scaling horizontally.
  const requests = new Map<string, { count: number; until: number }>();
  const server = createServer(async (req, res) => {
    for (const [key, value] of Object.entries(securityHeaders))
      res.setHeader(key, value);
    let path: string;
    try {
      path = new URL(req.url ?? "/", "http://localhost").pathname;
    } catch {
      json(res, 400, { error: "Invalid request URL." });
      return;
    }
    if (path === "/api/health" && req.method === "GET") {
      json(res, 200, {
        status: "ok",
        contactConfigured: Boolean(options.send),
      });
      return;
    }
    if (path === "/api/contact") {
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        json(res, 405, { error: "Use POST for contact requests." });
        return;
      }
      if (req.headers.origin !== options.origin) {
        json(res, 403, { error: "This origin is not allowed." });
        return;
      }
      if (
        req.headers["content-type"]?.split(";")[0].trim() !== "application/json"
      ) {
        json(res, 415, { error: "Send JSON content." });
        return;
      }
      const now = Date.now();
      for (const [key, entry] of requests)
        if (entry.until <= now) requests.delete(key);
      const address = options.trustProxy
        ? String(req.headers["x-real-ip"] ?? req.socket.remoteAddress)
        : String(req.socket.remoteAddress);
      let entry = requests.get(address);
      if (!entry) {
        if (requests.size >= 10_000) {
          json(res, 503, {
            error: "Contact service is busy. Please try later.",
          });
          return;
        }
        entry = { count: 0, until: now + 600_000 };
        requests.set(address, entry);
      }
      if (++entry.count > (options.maxRequests ?? 5)) {
        res.setHeader(
          "Retry-After",
          String(Math.ceil((entry.until - now) / 1000)),
        );
        json(res, 429, { error: "Too many attempts. Please try again later." });
        return;
      }
      try {
        const message = validateContact(await body(req));
        if (!message) {
          json(res, 400, {
            error:
              "Enter a name of 2–100 characters, a valid email and a message of 20–5000 characters.",
          });
          return;
        }
        if (!options.send) {
          json(res, 503, {
            error:
              "Email delivery is not configured. Please contact me through GitHub.",
          });
          return;
        }
        await options.send(message);
        json(res, 200, {
          success: true,
          message: "Your message was accepted by the email server. Thank you.",
        });
      } catch (error) {
        if (error instanceof SyntaxError)
          json(res, 400, { error: "The request contains invalid JSON." });
        else if (error instanceof Error && error.message === "BODY_LIMIT")
          json(res, 413, { error: "The request is too large." });
        else
          json(res, 502, {
            error:
              "Email delivery failed. Please try again later or contact me through GitHub.",
          });
      }
      return;
    }
    if (path.startsWith("/api/")) {
      json(res, 404, { error: "Endpoint not found." });
      return;
    }
    if (
      !options.staticDirectory ||
      !["GET", "HEAD"].includes(req.method ?? "")
    ) {
      json(res, 404, { error: "Not found." });
      return;
    }
    try {
      const root = resolve(options.staticDirectory);
      const file = resolve(
        root,
        "." + decodeURIComponent(path === "/" ? "/index.html" : path),
      );
      if (!file.startsWith(root + sep)) {
        json(res, 404, { error: "Not found." });
        return;
      }
      const info = await stat(file);
      if (!info.isFile()) throw new Error("NOT_FILE");
      let data = await readFile(file);
      let encoding: string | undefined;
      const accepted = String(req.headers["accept-encoding"] ?? "")
        .split(",")
        .map((value) => value.trim().split(";"))
        .filter(
          (parts) =>
            !parts.slice(1).some((part) => /^\s*q=0(?:\.0*)?\s*$/.test(part)),
        )
        .map((parts) => parts[0]);
      for (const [name, suffix] of [
        ["br", ".br"],
        ["gzip", ".gz"],
      ]) {
        if (!accepted.includes(name)) continue;
        try {
          data = await readFile(file + suffix);
          encoding = name;
          break;
        } catch {
          /* Serve the original when no compressed variant exists. */
        }
      }
      res.writeHead(200, {
        ...(encoding ? { "Content-Encoding": encoding } : {}),
        Vary: "Accept-Encoding",
        "Content-Type": mime[extname(file)] ?? "application/octet-stream",
        "Cache-Control": path.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      let page =
        '<!doctype html><html lang="en"><title>Page not found | Atajan</title><h1>Page not found</h1><a href="/">Return home</a></html>';
      try {
        page = await readFile(
          resolve(options.staticDirectory, "404.html"),
          "utf8",
        );
      } catch {
        /* Use the accessible fallback. */
      }
      res.end(req.method === "HEAD" ? undefined : page);
    }
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.timeout = 20_000;
  return server;
}
export function smtpSender(env: NodeJS.ProcessEnv): Options["send"] {
  const required = [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "CONTACT_FROM",
    "CONTACT_TO",
  ];
  if (!required.every((key) => env[key])) return undefined;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT ?? 587),
    secure: env.SMTP_SECURE === "true",
    requireTLS: env.SMTP_SECURE !== "true",
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return async ({ name, email, message }) => {
    const result = await transport.sendMail({
      from: env.CONTACT_FROM,
      to: env.CONTACT_TO,
      replyTo: email,
      subject: "Portfolio project enquiry",
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    if (!result.accepted.length || result.rejected.length)
      throw new Error("SMTP_REJECTED");
  };
}
