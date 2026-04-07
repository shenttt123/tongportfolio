import type { Project } from "../types";

export type ApiErrorPayload = {
  status: number;
  data: { error?: string; details?: { field: string; message: string }[]; slug?: string };
};

async function readErrorBody(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as ApiErrorPayload["data"];
  } catch {
    return { error: text };
  }
}

export function formatApiError(e: unknown): string {
  if (e && typeof e === "object" && "data" in e) {
    const err = e as ApiErrorPayload & { status?: number };
    const { data } = err;
    if (data.details?.length) {
      return data.details.map((x) => `${x.field}: ${x.message}`).join("; ");
    }
    if (data.error === "Slug already in use" && data.slug) {
      return `Slug already in use: ${data.slug}`;
    }
    if (data.error) return data.error;
    if (typeof err.status === "number") return `Request failed (HTTP ${err.status})`;
  }
  if (e instanceof TypeError && e.message.includes("fetch")) {
    return "Network error — check that the dev server is running (npm run dev).";
  }
  return "Request failed";
}

export async function adminListProjects(): Promise<Project[]> {
  const res = await fetch("/api/admin/projects");
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, data: data ?? {} };
  if (!Array.isArray(data)) {
    throw {
      status: res.status,
      data: {
        error:
          "Invalid response (expected a JSON array). Open the app via the Node dev server (npm run dev) so /api routes are proxied, not static HTML.",
      },
    };
  }
  return data;
}

export async function adminGetProject(id: number): Promise<Project> {
  const res = await fetch(`/api/admin/projects/${id}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data as Project;
}

export async function adminCreateProject(body: Record<string, unknown>): Promise<Project> {
  const res = await fetch("/api/admin/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data as Project;
}

export async function adminUpdateProject(
  id: number,
  body: Record<string, unknown>
): Promise<Project> {
  const res = await fetch(`/api/admin/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data as Project;
}

export async function adminDeleteProject(id: number): Promise<void> {
  const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
  if (res.status === 204) return;
  const data = await readErrorBody(res);
  throw { status: res.status, data };
}
