import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Project } from "../../types";
import { adminGetProject, formatApiError } from "../../lib/adminProjectsApi";
import {
  ProjectForm,
  projectToFormState,
} from "../../components/admin/ProjectForm";

export function AdminProjectEdit() {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = idParam ? parseInt(idParam, 10) : NaN;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Invalid project id");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const p = await adminGetProject(id);
        if (!cancelled) setProject(p);
      } catch (e) {
        if (!cancelled) setError(formatApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
        Loading project…
      </p>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <div className="rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error ?? "Project not found"}
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/projects")}
          className="text-sm text-brand-text-secondary hover:text-white"
        >
          ← Back to list
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-white tracking-tight mb-2">Edit project</h1>
      <p className="text-sm text-brand-text-secondary mb-8 font-mono">{project.slug}</p>
      <ProjectForm
        key={project.id}
        mode="edit"
        projectId={typeof project.id === "number" ? project.id : parseInt(String(project.id), 10)}
        initial={projectToFormState(project)}
        onSuccess={() => navigate("/admin/projects")}
        onCancel={() => navigate("/admin/projects")}
      />
    </div>
  );
}
