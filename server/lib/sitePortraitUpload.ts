import fs from "fs";
import path from "path";
import multer from "multer";

/** Persisted under project root; served at URL `/uploads/site/<filename>`. */
export const SITE_PORTRAIT_PUBLIC_PREFIX = "/uploads/site";

export function getSitePortraitDir(): string {
  return path.join(process.cwd(), "data", "uploads", "site");
}

export function ensureSitePortraitDir(): void {
  fs.mkdirSync(getSitePortraitDir(), { recursive: true });
}

const allowedMime = /^image\/(jpeg|png|gif|webp)$/i;

export const sitePortraitMulter = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureSitePortraitDir();
      cb(null, getSitePortraitDir());
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const safe = /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext.toLowerCase() : ".jpg";
      cb(null, `portrait-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safe}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed"));
    }
  },
});
