import type { RequestHandler } from "express";

/**
 * Prevents browsers and intermediary caches from reusing authenticated JSON
 * responses. Express otherwise turns matching conditional requests into a 304
 * response without a body, which API clients cannot deserialize.
 */
export const disablePrivateApiCaching: RequestHandler = (req, res, next) => {
  delete req.headers["if-none-match"];
  delete req.headers["if-modified-since"];

  res.setHeader(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.vary("Authorization");

  next();
};
