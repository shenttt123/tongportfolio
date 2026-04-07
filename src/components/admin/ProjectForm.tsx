import { useEffect, useState } from "react";
import type { Project } from "../../types";
import { parseListInput } from "../../lib/parseListInput";
import { useAdminSaveFeedback } from "../../context/AdminSaveFeedbackContext";
import {
  adminCreateProject,
  adminUpdateProject,
  formatApiError,
} from "../../lib/adminProjectsApi";

export type ProjectFormState = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  coverImage: string;
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  published: boolean;
  tagsText: string;
  galleryText: string;
};

export const emptyProjectFormState: ProjectFormState = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "",
  coverImage: "",
  githubUrl: "",
  demoUrl: "",
  featured: false,
  published: true,
  tagsText: "",
  galleryText: "",
};

export function projectToFormState(p: Project): ProjectFormState {
  return {
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    content: p.content,
    category: p.category,
    coverImage: p.coverImage,
    githubUrl: p.githubUrl,
    demoUrl: p.demoUrl,
    featured: p.featured,
    published: p.published,
    tagsText: p.tags.join("\n"),
    galleryText: p.gallery.join("\n"),
  };
}

function formStateToApiBody(form: ProjectFormState): Record<string, unknown> {
  return {
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    content: form.content,
    category: form.category,
    coverImage: form.coverImage,
    githubUrl: form.githubUrl,
    demoUrl: form.demoUrl,
    featured: form.featured,
    published: form.published,
    tags: parseListInput(form.tagsText),
    gallery: parseListInput(form.galleryText),
  };
}

const labelCls = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary mb-2";
const inputCls =
  "w-full rounded border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-white/30";
const textareaCls = `${inputCls} min-h-[100px] font-mono text-xs`;

type Props = {
  mode: "create" | "edit";
  projectId?: number;
  initial: ProjectFormState;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ProjectForm({ mode, projectId, initial, onSuccess, onCancel }: Props) {
  const { notify } = useAdminSaveFeedback();
  const [form, setForm] = useState<ProjectFormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  function set<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = formStateToApiBody(form);
      if (mode === "create") {
        await adminCreateProject(body);
      } else if (projectId != null) {
        await adminUpdateProject(projectId, body);
      }
      notify(true, mode === "create" ? "Project created." : "Project saved.");
      onSuccess();
    } catch (err) {
      const msg = formatApiError(err);
      setError(msg);
      notify(false, msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div
          className="rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={inputCls}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            className={inputCls}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            required
            autoComplete="off"
            placeholder="my-project-url"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            className={inputCls}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="summary">
            Summary
          </label>
          <textarea
            id="summary"
            className={textareaCls}
            rows={3}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            className={textareaCls}
            rows={8}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="coverImage">
            Cover image URL
          </label>
          <input
            id="coverImage"
            className={inputCls}
            type="text"
            value={form.coverImage}
            onChange={(e) => set("coverImage", e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="githubUrl">
            GitHub URL
          </label>
          <input
            id="githubUrl"
            className={inputCls}
            type="text"
            value={form.githubUrl}
            onChange={(e) => set("githubUrl", e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="demoUrl">
            Demo URL
          </label>
          <input
            id="demoUrl"
            className={inputCls}
            type="text"
            value={form.demoUrl}
            onChange={(e) => set("demoUrl", e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={`${labelCls} flex items-center gap-2 cursor-pointer`}>
            <input
              type="checkbox"
              className="rounded border-brand-border bg-brand-surface"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Featured
          </label>
        </div>
        <div>
          <label className={`${labelCls} flex items-center gap-2 cursor-pointer`}>
            <input
              type="checkbox"
              className="rounded border-brand-border bg-brand-surface"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Published
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="tagsText">
            Tags (one per line or comma-separated)
          </label>
          <textarea
            id="tagsText"
            className={textareaCls}
            rows={4}
            value={form.tagsText}
            onChange={(e) => set("tagsText", e.target.value)}
            placeholder="ESP32&#10;MQTT"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="galleryText">
            Gallery image URLs (one per line or comma-separated)
          </label>
          <textarea
            id="galleryText"
            className={textareaCls}
            rows={4}
            value={form.galleryText}
            onChange={(e) => set("galleryText", e.target.value)}
            placeholder="https://…"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded border border-brand-border px-4 py-2 text-sm text-brand-text-secondary hover:text-white hover:border-white/20 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
