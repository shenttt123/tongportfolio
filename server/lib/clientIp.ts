import type { Request } from "express";

/** Client IP; uses X-Forwarded-For when trust proxy is enabled (e.g. behind nginx). */
export function clientIp(req: Request): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) {
    return xf.split(",")[0].trim();
  }
  if (Array.isArray(xf) && xf[0]) {
    return xf[0].split(",")[0].trim();
  }
  const raw = req.socket.remoteAddress ?? "";
  return raw.replace(/^::ffff:/, "") || "unknown";
}
