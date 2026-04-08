import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../types";
import {
  adminDeleteProject,
  adminListProjects,
  formatApiError,
} from "../../lib/adminProjectsApi";

export function AdminProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await adminListProjects();
      setProjects(data);
    } catch (e) {
      setProjects([]);
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(p: Project) {
    const id = typeof p.id === "number" ? p.id : parseInt(String(p.id), 10);
    if (Number.isNaN(id)) return;
    const ok = window.confirm(
      `Delete project "${p.title}"? This cannot be undone.`
    );
    if (!ok) return;
    try {
      await adminDeleteProject(id);
      await load();
    } catch (e) {
      alert(formatApiError(e));
    }
  }

  if (loading) {
    return (
      <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
        Loading projects…
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-8">
        <h1 className="text-xl font-semibold text-white tracking-tight">Projects</h1>
        <Link
          to="/admin/projects/new"
          className="text-sm text-brand-text-secondary hover:text-white"
        >
          + New project
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-brand-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface/80">
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary">
                Title
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary">
                Slug
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary">
                Category
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary">
                Status
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary">
                Related to
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary">
                Pub
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary">
                Updated
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-brand-text-secondary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-brand-text-secondary">
                  No projects yet.{" "}
                  <Link to="/admin/projects/new" className="text-white underline">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              (Array.isArray(projects) ? projects : []).map((p) => {
                const id = typeof p.id === "number" ? p.id : String(p.id);
                return (
                  <tr
                    key={String(p.id)}
                    className="border-b border-brand-border/80 hover:bg-brand-surface/40"
                  >
                    <td className="px-4 py-3 text-brand-text-primary font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-brand-text-secondary font-mono text-xs">
                      {p.slug}
                    </td>
                    <td className="px-4 py-3 text-brand-text-secondary">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border ${
                        p.status === "production"
                          ? "border-green-700/50 bg-green-950/30 text-green-400"
                          : p.status === "in_progress"
                          ? "border-yellow-700/50 bg-yellow-950/30 text-yellow-400"
                          : "border-brand-border text-brand-text-secondary"
                      }`}>
                        {p.status === "in_progress" ? "In Progress" : p.status === "archived" ? "Archived" : "Production"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-text-secondary text-xs max-w-[10rem] truncate">
                      {p.relatedTo || "—"}
                    </td>
                    <td className="px-4 py-3 text-brand-text-secondary">{p.published ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-brand-text-secondary font-mono text-xs whitespace-nowrap">
                      {p.updatedAt}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                      <Link
                        to={`/admin/projects/${id}/edit`}
                        className="text-white/90 hover:text-white text-xs font-mono uppercase tracking-wider"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="text-red-400/90 hover:text-red-300 text-xs font-mono uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
