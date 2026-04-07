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
import { clientIp } from "./server/lib/clientIp";
import { adminBasicAuthMiddleware } from "./server/middleware/adminBasicAuth";
import { jsonError } from "./server/lib/jsonError";

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
    void visitorLogRepo.recordVisit(ip, path).catch((e) => console.error(e));
    res.status(204).send();
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

  const httpServer = http.createServer(app);

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
