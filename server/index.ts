import { createApp, smtpSender } from "./app.ts";
const port = Number(process.env.PORT ?? 3000);
const origin = process.env.APP_ORIGIN ?? "http://localhost:3000";
if (new URL(origin).origin !== origin)
  throw new Error("APP_ORIGIN must be a URL origin without a trailing slash.");
const server = createApp({
  origin,
  send: smtpSender(process.env),
  staticDirectory: "dist",
  trustProxy: process.env.TRUST_PROXY === "true",
});
server.listen(port, process.env.HOST ?? "127.0.0.1", () =>
  console.log(`Portfolio server listening on port ${port}.`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 15_000).unref();
  });
