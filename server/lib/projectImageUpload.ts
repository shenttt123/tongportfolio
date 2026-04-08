import fs from "fs";
import path from "path";
import multer from "multer";

export const PROJECT_IMAGE_PUBLIC_PREFIX = "/uploads/projects";

export function getProjectImageDir(): string {
  return path.join(process.cwd(), "data", "uploads", "projects");
}

export function ensureProjectImageDir(): void {
  fs.mkdirSync(getProjectImageDir(), { recursive: true });
}

const allowedMime = /^image\/(jpeg|png|gif|webp)$/i;

export const projectImageMulter = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureProjectImageDir();
      cb(null, getProjectImageDir());
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const safe = /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext.toLowerCase() : ".jpg";
      const base = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-z0-9_-]/gi, "_")
        .slice(0, 40);
      cb(null, `proj-${Date.now()}-${base}${safe}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, or WebP images are allowed"));
    }
  },
});
