import { createHash, timingSafeEqual } from "crypto";
import type { RequestHandler } from "express";

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

/**
 * Protects `/admin` (SPA) and `/api/admin/*` when `ADMIN_AUTH_PASSWORD` is set.
 * Optional user via `ADMIN_AUTH_USER` (default `admin`).
 * Set `ADMIN_AUTH_DISABLED=true` to skip (local dev only).
 */
export function adminBasicAuthMiddleware(): RequestHandler {
  return (req, res, next) => {
    const path = req.path || "";
    const needGate = path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/admin");
    if (!needGate) {
      next();
      return;
    }

    const password = process.env.ADMIN_AUTH_PASSWORD?.trim();
    if (!password || process.env.ADMIN_AUTH_DISABLED === "true") {
      next();
      return;
    }

    const user = (process.env.ADMIN_AUTH_USER || "admin").trim();
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Basic ")) {
      res.setHeader("WWW-Authenticate", 'Basic realm="CMS Admin"');
      res.status(401).send("Authentication required");
      return;
    }

    let decoded: string;
    try {
      decoded = Buffer.from(hdr.slice(6), "base64").toString("utf8");
    } catch {
      res.setHeader("WWW-Authenticate", 'Basic realm="CMS Admin"');
      res.status(401).send("Invalid authentication");
      return;
    }

    const colon = decoded.indexOf(":");
    const u = colon >= 0 ? decoded.slice(0, colon) : "";
    const p = colon >= 0 ? decoded.slice(colon + 1) : "";

    if (u !== user || !hashEqual(p, password)) {
      res.setHeader("WWW-Authenticate", 'Basic realm="CMS Admin"');
      res.status(401).send("Invalid credentials");
      return;
    }

    next();
  };
}
