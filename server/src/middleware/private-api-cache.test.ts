import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express from "express";
import { disablePrivateApiCaching } from "./private-api-cache";

test("authenticated API responses never become bodyless 304 responses", async () => {
  const app = express();
  app.get("/private", disablePrivateApiCaching, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  const server = app.listen(0);

  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const port = (server.address() as AddressInfo).port;
    const url = `http://127.0.0.1:${port}/private`;
    const firstResponse = await fetch(url);
    const etag = firstResponse.headers.get("etag");

    assert.equal(firstResponse.status, 200);
    assert.ok(etag);
    assert.deepEqual(await firstResponse.json(), { ok: true });

    const conditionalResponse = await fetch(url, {
      headers: {
        "If-None-Match": etag,
        "If-Modified-Since": new Date().toUTCString(),
      },
    });

    assert.equal(conditionalResponse.status, 200);
    assert.deepEqual(await conditionalResponse.json(), { ok: true });
    assert.match(
      conditionalResponse.headers.get("cache-control") || "",
      /no-store/,
    );
    assert.match(
      conditionalResponse.headers.get("vary") || "",
      /Authorization/,
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
