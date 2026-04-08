import { parseListInput } from "./parseListInput";

async function readJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await readJson(res);
  if (!res.ok) {
    const errObj =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : { error: `HTTP ${res.status} ${res.statusText || ""}`.trim() };
    if (!("error" in errObj) && !("details" in errObj)) {
      (errObj as { error: string }).error = `HTTP ${res.status}`;
    }
    throw { status: res.status, data: errObj };
  }
  return data as T;
}

export async function apiVoid(url: string, init?: RequestInit): Promise<void> {
  const res = await fetch(url, init);
  if (res.status === 204) return;
  const data = await readJson(res);
  throw { status: res.status, data: data ?? {} };
}

export type SiteHomeAdmin = {
  id: number;
  portraitImagePath: string;
  shortIntro: string;
  heroText: string;
  technicalFocusTags: string[];
  contactPreviewLinks: { label: string; url: string }[];
};

export const adminSiteHome = {
  get: () => apiJson<SiteHomeAdmin>("/api/admin/site-home"),
  put: (body: Record<string, unknown>) =>
    apiJson<SiteHomeAdmin>("/api/admin/site-home", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

/** Multipart upload; saves under `data/uploads/site` and returns a path like `/uploads/site/portrait-….jpg`. */
export async function uploadSitePortraitImage(file: File): Promise<{ portraitImagePath: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload/site-portrait", {
    method: "POST",
    body: form,
  });
  const data = await readJson(res);
  if (!res.ok) {
    const errObj =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : { error: `HTTP ${res.status}` };
    if (!("error" in errObj)) (errObj as { error: string }).error = `HTTP ${res.status}`;
    throw { status: res.status, data: errObj };
  }
  return data as { portraitImagePath: string };
}

export type NoteAdmin = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  published: boolean;
};

export const adminNotes = {
  list: () => apiJson<NoteAdmin[]>("/api/admin/notes"),
  get: (id: number) => apiJson<NoteAdmin>(`/api/admin/notes/${id}`),
  create: (body: Record<string, unknown>) =>
    apiJson<NoteAdmin>("/api/admin/notes", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: Record<string, unknown>) =>
    apiJson<NoteAdmin>(`/api/admin/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: number) => apiVoid(`/api/admin/notes/${id}`, { method: "DELETE" }),
};

export type ToolAdmin = {
  id: number;
  title: string;
  category: string;
  description: string;
  link: string;
  tags: string[];
  published: boolean;
  sortOrder: number;
};

export const adminTools = {
  list: () => apiJson<ToolAdmin[]>("/api/admin/tools"),
  create: (body: Record<string, unknown>) =>
    apiJson<ToolAdmin>("/api/admin/tools", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: Record<string, unknown>) =>
    apiJson<ToolAdmin>(`/api/admin/tools/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: number) => apiVoid(`/api/admin/tools/${id}`, { method: "DELETE" }),
};

export type ReadingAdmin = {
  id: number;
  title: string;
  type: string;
  author: string;
  link: string;
  summary: string;
  category: string;
  recommended: boolean;
  sortOrder: number;
};

export const adminReading = {
  list: () => apiJson<ReadingAdmin[]>("/api/admin/reading"),
  create: (body: Record<string, unknown>) =>
    apiJson<ReadingAdmin>("/api/admin/reading", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: Record<string, unknown>) =>
    apiJson<ReadingAdmin>(`/api/admin/reading/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: number) => apiVoid(`/api/admin/reading/${id}`, { method: "DELETE" }),
};

export type ExperienceAdmin = {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
  bullets: string[];
  sortOrder: number;
};

export type AboutBundleAdmin = {
  bio: string;
  currentFocus: string[];
  stack: { category: string; items: string[] }[];
  contact: { email: string; location: string; github: string; linkedin: string };
  experiences: ExperienceAdmin[];
};

export const adminAbout = {
  get: () => apiJson<AboutBundleAdmin>("/api/admin/about"),
  put: (body: Record<string, unknown>) =>
    apiJson<AboutBundleAdmin>("/api/admin/about", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export const adminExperiences = {
  create: (body: Record<string, unknown>) =>
    apiJson<ExperienceAdmin>("/api/admin/experiences", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: Record<string, unknown>) =>
    apiJson<ExperienceAdmin>(`/api/admin/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: number) => apiVoid(`/api/admin/experiences/${id}`, { method: "DELETE" }),
};

export type VisitorLogRow = {
  id: number;
  ip: string;
  path: string;
  createdAt: string;
};

export function adminVisitorLogs(limit = 500): Promise<VisitorLogRow[]> {
  return apiJson<VisitorLogRow[]>(`/api/admin/visitor-logs?limit=${limit}`);
}

export function adminDeleteVisitorLogsByIds(ids: number[]): Promise<{ deleted: number }> {
  return apiJson<{ deleted: number }>("/api/admin/visitor-logs", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export function adminDeleteVisitorLogsByIp(ip: string): Promise<{ deleted: number }> {
  return apiJson<{ deleted: number }>("/api/admin/visitor-logs", {
    method: "DELETE",
    body: JSON.stringify({ ip }),
  });
}

export type ContactInquiryRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  createdAt: string;
};

export function adminContactInquiries(limit = 500): Promise<ContactInquiryRow[]> {
  return apiJson<ContactInquiryRow[]>(`/api/admin/contact-inquiries?limit=${limit}`);
}

export type ProjectImageRow = {
  id: number;
  projectId: number | null;
  url: string;
  filename: string;
  label: string;
  createdAt: string;
};

export function adminListProjectImages(projectId?: number | null): Promise<ProjectImageRow[]> {
  const qs = projectId != null ? `?projectId=${projectId}` : "";
  return apiJson<ProjectImageRow[]>(`/api/admin/project-images${qs}`);
}

export async function adminUploadProjectImages(
  files: File[],
  projectId?: number | null
): Promise<ProjectImageRow[]> {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  if (projectId != null) form.append("projectId", String(projectId));
  const res = await fetch("/api/admin/project-images/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errObj = data && typeof data === "object" ? data as Record<string, unknown> : { error: `HTTP ${res.status}` };
    if (!("error" in errObj)) (errObj as { error: string }).error = `HTTP ${res.status}`;
    throw { status: res.status, data: errObj };
  }
  return data as ProjectImageRow[];
}

export function adminDeleteProjectImage(id: number): Promise<void> {
  return apiVoid(`/api/admin/project-images/${id}`, { method: "DELETE" });
}

export type DeleteProjectImagesResult = {
  deleted: number;
  blocked: {
    imageId: number;
    url: string;
    usedIn: { projectId: number; projectTitle: string; field: "coverImage" | "gallery" }[];
  }[];
};

export function adminDeleteProjectImages(ids: number[]): Promise<DeleteProjectImagesResult> {
  return apiJson<DeleteProjectImagesResult>("/api/admin/project-images", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export function adminUpdateProjectImageLabel(id: number, label: string): Promise<ProjectImageRow> {
  return apiJson<ProjectImageRow>(`/api/admin/project-images/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ label }),
  });
}

export { parseListInput };
