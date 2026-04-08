import "dotenv/config";
import express from "express";
import http from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as projectRepo from "./server/repositories/projectRepository";
import * as siteHomeRepo from "./server/repositories/siteHomeRepository";
import * as noteRepo from "./server/repositories/noteRepository";
import * as toolRepo from "./server/repositories/toolRepository";
import * as readingRepo from "./server/repositories/readingRepository";
import * as aboutRepo from "./server/repositories/aboutRepository";
import * as visitorLogRepo from "./server/repositories/visitorLogRepository";
import * as contactInquiryRepo from "./server/repositories/contactInquiryRepository";
import * as projectImageRepo from "./server/repositories/projectImageRepository";
import * as navItemRepo from "./server/repositories/navItemRepository";
import { clientIp } from "./server/lib/clientIp";
import { adminBasicAuthMiddleware } from "./server/middleware/adminBasicAuth";
import { jsonError } from "./server/lib/jsonError";
import { sitePortraitMulter, SITE_PORTRAIT_PUBLIC_PREFIX } from "./server/lib/sitePortraitUpload";
import {
  projectImageMulter,
  PROJECT_IMAGE_PUBLIC_PREFIX,
  getProjectImageDir,
  ensureProjectImageDir,
} from "./server/lib/projectImageUpload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Empty until demos CMS exists; public GET returns []. */
const demos: {
  id: number;
  title: string;
  description: string;
  link: string;
  tags: string[];
  thumbnail: string;
}[] = [];

async function listenHttpServer(
  server: http.Server,
  preferredPort: number,
  maxAttempts = 25
): Promise<number> {
  let port = preferredPort;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const onErr = (err: NodeJS.ErrnoException) => {
          server.off("error", onErr);
          reject(err);
        };
        server.once("error", onErr);
        server.listen(port, "0.0.0.0", () => {
          server.off("error", onErr);
          resolve();
        });
      });
      return port;
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${port} is in use, trying ${port + 1}…`);
        port++;
        await new Promise<void>((r) => {
          if (server.listening) server.close(() => r());
          else r();
        });
        continue;
      }
      throw e;
    }
  }
  throw new Error(`No free TCP port after ${maxAttempts} attempts from ${preferredPort}`);
}

async function startServer() {
  const app = express();
  const preferredPort = Number(process.env.PORT) || 3000;

  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(adminBasicAuthMiddleware());

  // --- Public APIs ---

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Public nav items (visible only, sorted)
  app.get("/api/nav-items", async (_req, res) => {
    try {
      res.json(await navItemRepo.listNavItems(true));
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load nav items", e);
    }
  });

  app.get("/api/site-home", async (_req, res) => {
    try {
      res.json(await siteHomeRepo.getSiteHome());
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load site home", e);
    }
  });

  // Projects
  app.get("/api/projects", async (_req, res) => {
    try {
      res.json(await projectRepo.listPublishedProjects());
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load projects", e);
    }
  });
  app.get("/api/projects/:slug", async (req, res) => {
    try {
      const project = await projectRepo.getPublishedBySlug(req.params.slug);
      project ? res.json(project) : res.status(404).json({ error: "Project not found" });
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load project", e);
    }
  });

  app.get("/api/notes", async (_req, res) => {
    try {
      res.json(await noteRepo.listPublishedNotes());
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load notes", e);
    }
  });
  app.get("/api/notes/:slug", async (req, res) => {
    try {
      const note = await noteRepo.getPublishedNoteBySlug(req.params.slug);
      note ? res.json(note) : res.status(404).json({ error: "Note not found" });
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load note", e);
    }
  });

  app.get("/api/tools", async (_req, res) => {
    try {
      res.json(await toolRepo.listPublicTools());
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load tools", e);
    }
  });

  app.get("/api/reading", async (_req, res) => {
    try {
      res.json(await readingRepo.listPublicReading());
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load reading list", e);
    }
  });

  app.get("/api/demos", (_req, res) => res.json(demos));

  app.get("/api/about", async (_req, res) => {
    try {
      res.json(await aboutRepo.getPublicAboutContent());
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load about", e);
    }
  });

  app.post("/api/visit", (req, res) => {
    const raw = req.body?.path;
    const path = typeof raw === "string" ? raw : "";
    const ip = clientIp(req);
    const isLocal = ip === "127.0.0.1" || ip === "::1" || ip.startsWith("::ffff:127.");
    if (!isLocal) {
      void visitorLogRepo.recordVisit(ip, path).catch((e) => console.error(e));
    }
    res.status(204).send();
  });

  app.post("/api/contact/inquiry", async (req, res) => {
    try {
      const body = req.body ?? {};
      const name = typeof body.name === "string" ? body.name : "";
      const email = typeof body.email === "string" ? body.email : "";
      const subject = typeof body.subject === "string" ? body.subject : "";
      const message = typeof body.message === "string" ? body.message : "";
      const ip = clientIp(req);
      const row = await contactInquiryRepo.createInquiry({ name, email, subject, message, ip });
      res.status(201).json({ ok: true, id: row.id });
    } catch (e) {
      if (e instanceof Error && e.message === "VALIDATION") {
        res.status(400).json({ error: "Name, email, and message are required" });
        return;
      }
      if (e instanceof Error && e.message === "INVALID_EMAIL") {
        res.status(400).json({ error: "Invalid email address" });
        return;
      }
      console.error(e);
      jsonError(res, 500, "Could not save inquiry", e);
    }
  });

  // --- Admin: Nav items ---
  app.get("/api/admin/nav-items", async (_req, res) => {
    try {
      res.json(await navItemRepo.listNavItems(false));
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load nav items", e);
    }
  });

  app.put("/api/admin/nav-items", async (req, res) => {
    try {
      const updates = req.body;
      if (!Array.isArray(updates)) {
        res.status(400).json({ error: "Body must be an array of updates" });
        return;
      }
      res.json(await navItemRepo.updateNavItems(updates));
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to update nav items", e);
    }
  });

  // --- Admin: Site home ---
  app.get("/api/admin/site-home", async (_req, res) => {
    try {
      res.json(await siteHomeRepo.getSiteHome());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load site home" });
    }
  });
  app.put("/api/admin/site-home", async (req, res) => {
    try {
      res.json(await siteHomeRepo.updateSiteHome(req.body ?? {}));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update site home" });
    }
  });

  app.post("/api/admin/upload/site-portrait", (req, res) => {
    sitePortraitMulter.single("file")(req, res, (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        res.status(400).json({ error: msg });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      const portraitImagePath = `${SITE_PORTRAIT_PUBLIC_PREFIX}/${req.file.filename}`;
      res.json({ portraitImagePath });
    });
  });

  app.get("/api/admin/visitor-logs", async (req, res) => {
    const q = parseInt(String(req.query.limit ?? "500"), 10);
    const limit = Number.isNaN(q) ? 500 : q;
    try {
      res.json(await visitorLogRepo.listVisitorLogs(limit));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load visitor logs" });
    }
  });

  // DELETE by ids array OR by ip string
  app.delete("/api/admin/visitor-logs", async (req, res) => {
    try {
      const body = req.body ?? {};
      // delete by list of ids
      if (Array.isArray(body.ids) && body.ids.length > 0) {
        const ids = (body.ids as unknown[])
          .map((x) => parseInt(String(x), 10))
          .filter((n) => !Number.isNaN(n));
        const count = await visitorLogRepo.deleteVisitorLogsByIds(ids);
        res.json({ deleted: count });
        return;
      }
      // delete all for an ip
      if (typeof body.ip === "string" && body.ip.trim()) {
        const count = await visitorLogRepo.deleteVisitorLogsByIp(body.ip.trim());
        res.json({ deleted: count });
        return;
      }
      res.status(400).json({ error: "Provide either ids (array) or ip (string)" });
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to delete visitor logs", e);
    }
  });

  app.get("/api/admin/contact-inquiries", async (req, res) => {
    const q = parseInt(String(req.query.limit ?? "500"), 10);
    const limit = Number.isNaN(q) ? 500 : q;
    try {
      res.json(await contactInquiryRepo.listInquiries(limit));
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load contact inquiries", e);
    }
  });

  // --- Admin: Projects ---
  app.get("/api/admin/projects", async (_req, res) => {
    try {
      res.json(await projectRepo.listAllProjects());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load projects" });
    }
  });

  app.get("/api/admin/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    try {
      const project = await projectRepo.getProjectById(id);
      project ? res.json(project) : res.status(404).json({ error: "Project not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load project" });
    }
  });

  app.post("/api/admin/projects", async (req, res) => {
    try {
      const created = await projectRepo.createProject(req.body ?? {});
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof projectRepo.ProjectValidationError) {
        res.status(400).json({ error: "Validation failed", details: e.details });
        return;
      }
      if (e instanceof projectRepo.ProjectSlugTakenError) {
        res.status(409).json({ error: "Slug already in use", slug: e.slug });
        return;
      }
      console.error(e);
      res.status(500).json({ error: "Could not create project" });
    }
  });

  app.put("/api/admin/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    try {
      const updated = await projectRepo.updateProject(id, req.body ?? {});
      updated ? res.json(updated) : res.status(404).json({ error: "Project not found" });
    } catch (e) {
      if (e instanceof projectRepo.ProjectValidationError) {
        res.status(400).json({ error: "Validation failed", details: e.details });
        return;
      }
      if (e instanceof projectRepo.ProjectSlugTakenError) {
        res.status(409).json({ error: "Slug already in use", slug: e.slug });
        return;
      }
      console.error(e);
      res.status(500).json({ error: "Could not update project" });
    }
  });

  app.delete("/api/admin/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    try {
      const ok = await projectRepo.deleteProject(id);
      ok ? res.status(204).send() : res.status(404).json({ error: "Project not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not delete project" });
    }
  });

  // --- Admin: Notes ---
  app.get("/api/admin/notes", async (_req, res) => {
    try {
      res.json(await noteRepo.listAllNotes());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load notes" });
    }
  });
  app.get("/api/admin/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    try {
      const n = await noteRepo.getNoteById(id);
      n ? res.json(n) : res.status(404).json({ error: "Note not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load note" });
    }
  });
  app.post("/api/admin/notes", async (req, res) => {
    try {
      const created = await noteRepo.createNote(req.body ?? {});
      res.status(201).json(created);
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not create note" });
    }
  });
  app.put("/api/admin/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    try {
      const updated = await noteRepo.updateNote(id, req.body ?? {});
      updated ? res.json(updated) : res.status(404).json({ error: "Note not found" });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not update note" });
    }
  });
  app.delete("/api/admin/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    try {
      const ok = await noteRepo.deleteNote(id);
      ok ? res.status(204).send() : res.status(404).json({ error: "Note not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not delete note" });
    }
  });

  // --- Admin: Tools ---
  app.get("/api/admin/tools", async (_req, res) => {
    try {
      res.json(await toolRepo.listAllTools());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load tools" });
    }
  });
  app.get("/api/admin/tools/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    try {
      const t = await toolRepo.getToolById(id);
      t ? res.json(t) : res.status(404).json({ error: "Tool not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load tool" });
    }
  });
  app.post("/api/admin/tools", async (req, res) => {
    try {
      res.status(201).json(await toolRepo.createTool(req.body ?? {}));
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not create tool" });
    }
  });
  app.put("/api/admin/tools/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    try {
      const updated = await toolRepo.updateTool(id, req.body ?? {});
      updated ? res.json(updated) : res.status(404).json({ error: "Tool not found" });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not update tool" });
    }
  });
  app.delete("/api/admin/tools/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    try {
      const ok = await toolRepo.deleteTool(id);
      ok ? res.status(204).send() : res.status(404).json({ error: "Tool not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not delete tool" });
    }
  });

  // --- Admin: Reading ---
  app.get("/api/admin/reading", async (_req, res) => {
    try {
      res.json(await readingRepo.listAllReading());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load reading items" });
    }
  });
  app.get("/api/admin/reading/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const r = await readingRepo.getReadingById(id);
      r ? res.json(r) : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load item" });
    }
  });
  app.post("/api/admin/reading", async (req, res) => {
    try {
      res.status(201).json(await readingRepo.createReading(req.body ?? {}));
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not create reading item" });
    }
  });
  app.put("/api/admin/reading/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const updated = await readingRepo.updateReading(id, req.body ?? {});
      updated ? res.json(updated) : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not update reading item" });
    }
  });
  app.delete("/api/admin/reading/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const ok = await readingRepo.deleteReading(id);
      ok ? res.status(204).send() : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not delete" });
    }
  });

  // --- Admin: About bundle + experiences ---
  app.get("/api/admin/about", async (_req, res) => {
    try {
      res.json(await aboutRepo.getAdminAboutBundle());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load about" });
    }
  });
  app.put("/api/admin/about", async (req, res) => {
    try {
      res.json(await aboutRepo.updateAboutPage(req.body ?? {}));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update about" });
    }
  });

  app.get("/api/admin/experiences", async (_req, res) => {
    try {
      res.json(await aboutRepo.listExperiences());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load experiences" });
    }
  });
  app.get("/api/admin/experiences/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const ex = await aboutRepo.getExperienceById(id);
      ex ? res.json(ex) : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load experience" });
    }
  });
  app.post("/api/admin/experiences", async (req, res) => {
    try {
      res.status(201).json(await aboutRepo.createExperience(req.body ?? {}));
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not create experience" });
    }
  });
  app.put("/api/admin/experiences/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const updated = await aboutRepo.updateExperience(id, req.body ?? {});
      updated ? res.json(updated) : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Could not update experience" });
    }
  });
  app.delete("/api/admin/experiences/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const ok = await aboutRepo.deleteExperience(id);
      ok ? res.status(204).send() : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not delete experience" });
    }
  });

  // --- Admin: Project images ---
  ensureProjectImageDir();

  // Upload 1–20 images at once (field name: "files")
  app.post("/api/admin/project-images/upload", (req, res) => {
    projectImageMulter.array("files", 20)(req, res, async (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        res.status(400).json({ error: msg });
        return;
      }
      const files = req.file
        ? [req.file]
        : Array.isArray(req.files)
        ? (req.files as Express.Multer.File[])
        : [];
      if (files.length === 0) {
        res.status(400).json({ error: "No files uploaded" });
        return;
      }
      const rawProjectId = req.body?.projectId;
      const projectId =
        rawProjectId != null && rawProjectId !== ""
          ? parseInt(String(rawProjectId), 10)
          : null;
      try {
        const created = await Promise.all(
          files.map((f) =>
            projectImageRepo.createProjectImage({
              projectId: Number.isNaN(projectId as number) ? null : projectId,
              url: `${PROJECT_IMAGE_PUBLIC_PREFIX}/${f.filename}`,
              filename: f.filename,
              label: "",
            })
          )
        );
        res.status(201).json(created);
      } catch (e) {
        console.error(e);
        jsonError(res, 500, "Failed to save image records", e);
      }
    });
  });

  // List all images (or filter by ?projectId=)
  app.get("/api/admin/project-images", async (req, res) => {
    try {
      const pidRaw = req.query.projectId;
      if (pidRaw != null && pidRaw !== "") {
        const pid = parseInt(String(pidRaw), 10);
        res.json(await projectImageRepo.listProjectImages(Number.isNaN(pid) ? null : pid));
      } else {
        res.json(await projectImageRepo.listAllProjectImages());
      }
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to load project images", e);
    }
  });

  // Update label
  app.patch("/api/admin/project-images/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
    try {
      const label = typeof req.body?.label === "string" ? req.body.label : "";
      const row = await projectImageRepo.updateProjectImageLabel(id, label);
      row ? res.json(row) : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to update image", e);
    }
  });

  // Delete single
  app.delete("/api/admin/project-images/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
    try {
      const ok = await projectImageRepo.deleteProjectImage(id, getProjectImageDir());
      ok ? res.status(204).send() : res.status(404).json({ error: "Not found" });
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to delete image", e);
    }
  });

  // Delete bulk — skips images that are currently used in a project
  app.delete("/api/admin/project-images", async (req, res) => {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "ids (array) required" });
      return;
    }
    const parsed = (ids as unknown[]).map((x) => parseInt(String(x), 10)).filter((n) => !Number.isNaN(n));
    try {
      const inUse = await projectImageRepo.checkImageUsage(parsed);
      const inUseIds = new Set(inUse.map((u) => u.imageId));
      const deletable = parsed.filter((id) => !inUseIds.has(id));
      const deleted = await projectImageRepo.deleteProjectImages(deletable, getProjectImageDir());
      res.json({
        deleted,
        blocked: inUse.map((u) => ({
          imageId: u.imageId,
          url: u.url,
          usedIn: u.usedIn,
        })),
      });
    } catch (e) {
      console.error(e);
      jsonError(res, 500, "Failed to delete images", e);
    }
  });

  const httpServer = http.createServer(app);

  const uploadsStaticRoot = path.join(process.cwd(), "data", "uploads");
  app.use("/uploads", express.static(uploadsStaticRoot));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: { server: httpServer },
        hmr:
          process.env.DISABLE_HMR === "true"
            ? false
            : { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = await listenHttpServer(httpServer, preferredPort);
  console.log(`Server running on http://localhost:${port}`);
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
