import type { Response } from "express";

/** JSON error body; includes Prisma/SQLite message in `detail` for debugging (e.g. curl / EC2). */
export function jsonError(res: Response, status: number, message: string, err?: unknown): void {
  const payload: { error: string; detail?: string } = { error: message };
  if (err instanceof Error && err.message) {
    payload.detail = err.message;
  }
  res.status(status).json(payload);
}
