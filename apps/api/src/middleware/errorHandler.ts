import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

interface DuplicateKeyError {
  code: 11000;
  keyValue: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is DuplicateKeyError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === 11000
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join("; ");
    return res.status(400).json({ error: message });
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 5 MB."
        : err.message;
    return res.status(400).json({ error: message });
  }

  if (err instanceof MongooseError.CastError) {
    return res.status(404).json({ error: "Not found." });
  }

  if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyValue)[0] ?? "value";
    return res.status(409).json({ error: `An account with this ${field} already exists.` });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}
