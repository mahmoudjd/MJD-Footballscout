import { randomUUID } from "node:crypto";
import type { Request, RequestHandler } from "express";
import logger from "../logger/logger";
import type { AuthenticatedRequest } from "../shared/auth";

const REQUEST_ID_HEADER = "x-request-id";

function getRequestId(req: Request) {
  const forwardedRequestId = req.header(REQUEST_ID_HEADER)?.trim();
  return forwardedRequestId && forwardedRequestId.length <= 128
    ? forwardedRequestId
    : randomUUID();
}

function getUserId(req: Request) {
  return (req as AuthenticatedRequest).user?.userId || "anonymous";
}

function getRequestPath(req: Request) {
  return `${req.baseUrl}${req.path}`;
}

function errorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

function writeLog(status: number, message: string) {
  if (status >= 500) {
    logger.error(message);
    return;
  }
  if (status >= 400) {
    logger.warn(message);
    return;
  }
  logger.info(message);
}

export function createFeatureRequestLogger(feature: string): RequestHandler {
  return (req, res, next) => {
    const requestId = getRequestId(req);
    const startedAt = performance.now();
    res.locals.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    res.once("finish", () => {
      const status = res.statusCode;
      writeLog(
        status,
        `[${feature}] request completed ${JSON.stringify({
          requestId,
          method: req.method,
          path: getRequestPath(req),
          status,
          durationMs: Math.round(performance.now() - startedAt),
          userId: getUserId(req),
        })}`,
      );
    });

    next();
  };
}

export function logFeatureError(
  feature: string,
  operation: string,
  req: Request,
  error: unknown,
  status: number,
) {
  writeLog(
    status,
    `[${feature}] operation failed ${JSON.stringify({
      requestId: resRequestId(req),
      operation,
      method: req.method,
      path: getRequestPath(req),
      status,
      userId: getUserId(req),
      error: errorDetails(error),
    })}`,
  );
}

function resRequestId(req: Request) {
  return req.res?.locals.requestId || "unknown";
}
