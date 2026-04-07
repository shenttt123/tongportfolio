import { Prisma, type Project as PrismaProject } from "@prisma/client";
import { prisma } from "../db";

/** JSON shape returned by /api/projects* — matches src/types.ts Project */
export type ProjectDto = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  gallery: string[];
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectValidationDetail = { field: string; message: string };

export class ProjectValidationError extends Error {
  readonly details: ProjectValidationDetail[];
  constructor(details: ProjectValidationDetail[]) {
    super("Validation failed");
    this.name = "ProjectValidationError";
    this.details = details;
  }
}

export class ProjectSlugTakenError extends Error {
  constructor(public readonly slug: string) {
    super(`Slug already in use: ${slug}`);
    this.name = "ProjectSlugTakenError";
  }
}

function normalizeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/** Always returns a string[]; never null (frontend-safe). */
export function asStringArray(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function toDto(row: PrismaProject): ProjectDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    category: row.category,
    tags: asStringArray(row.tags),
    coverImage: row.coverImage,
    gallery: asStringArray(row.gallery),
    githubUrl: row.githubUrl,
    demoUrl: row.demoUrl,
    featured: row.featured,
    published: row.published,
    createdAt: row.createdAt.toISOString().slice(0, 10),
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
  };
}

function isUniqueConstraintOnSlug(e: Prisma.PrismaClientKnownRequestError): boolean {
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.includes("slug");
  if (typeof target === "string") return target.includes("slug");
  return true;
}

export async function listPublishedProjects(): Promise<ProjectDto[]> {
  const rows = await prisma.project.findMany({
    where: { published: true },
    orderBy: { id: "asc" },
  });
  return rows.map(toDto);
}

export async function getPublishedBySlug(slug: string): Promise<ProjectDto | null> {
  const row = await prisma.project.findFirst({
    where: { slug, published: true },
  });
  return row ? toDto(row) : null;
}

/** All projects (including unpublished) — admin list. */
export async function listAllProjects(): Promise<ProjectDto[]> {
  const rows = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toDto);
}

/** Single project by numeric id — admin edit (ignores published). */
export async function getProjectById(id: number): Promise<ProjectDto | null> {
  const row = await prisma.project.findUnique({ where: { id } });
  return row ? toDto(row) : null;
}

function validateCreate(body: Record<string, unknown>): {
  title: string;
  slug: string;
  summary: string;
  category: string;
  content: string;
  coverImage: string;
  tags: string[];
  gallery: string[];
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  published: boolean;
} {
  const errors: ProjectValidationDetail[] = [];
  const title = normalizeString(body.title);
  const slug = normalizeString(body.slug);
  const summary = normalizeString(body.summary);
  const category = normalizeString(body.category);
  if (!title) errors.push({ field: "title", message: "Required" });
  if (!slug) errors.push({ field: "slug", message: "Required" });
  if (!summary) errors.push({ field: "summary", message: "Required" });
  if (!category) errors.push({ field: "category", message: "Required" });
  if (errors.length) throw new ProjectValidationError(errors);

  return {
    title,
    slug,
    summary,
    category,
    content: normalizeString(body.content),
    coverImage: normalizeString(body.coverImage),
    tags: asStringArray(body.tags),
    gallery: asStringArray(body.gallery),
    githubUrl: normalizeString(body.githubUrl),
    demoUrl: normalizeString(body.demoUrl),
    featured: Boolean(body.featured),
    published: body.published !== undefined ? Boolean(body.published) : true,
  };
}

export async function createProject(
  body: Record<string, unknown>
): Promise<ProjectDto> {
  const data = validateCreate(body);

  try {
    const row = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        category: data.category,
        content: data.content,
        coverImage: data.coverImage,
        tags: data.tags,
        gallery: data.gallery,
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
        featured: data.featured,
        published: data.published,
      },
    });
    return toDto(row);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && isUniqueConstraintOnSlug(e)) {
      throw new ProjectSlugTakenError(data.slug);
    }
    throw e;
  }
}

function validateUpdatePatch(body: Record<string, unknown>): void {
  // Sync checks only; slug uniqueness checked async in updateProject
  const errors: ProjectValidationDetail[] = [];
  if (body.title !== undefined && !normalizeString(body.title)) {
    errors.push({ field: "title", message: "Cannot be empty" });
  }
  if (body.slug !== undefined && !normalizeString(body.slug)) {
    errors.push({ field: "slug", message: "Cannot be empty" });
  }
  if (body.summary !== undefined && !normalizeString(body.summary)) {
    errors.push({ field: "summary", message: "Cannot be empty" });
  }
  if (body.category !== undefined && !normalizeString(body.category)) {
    errors.push({ field: "category", message: "Cannot be empty" });
  }
  if (errors.length) throw new ProjectValidationError(errors);
}

export async function updateProject(
  id: number,
  body: Record<string, unknown>
): Promise<ProjectDto | null> {
  validateUpdatePatch(body);

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return null;

  const nextSlug =
    body.slug !== undefined ? normalizeString(body.slug) : existing.slug;
  if (body.slug !== undefined) {
    const taken = await prisma.project.findFirst({
      where: { slug: nextSlug, NOT: { id } },
    });
    if (taken) throw new ProjectSlugTakenError(nextSlug);
  }

  const nextTags =
    body.tags !== undefined ? asStringArray(body.tags) : asStringArray(existing.tags);
  const nextGallery =
    body.gallery !== undefined
      ? asStringArray(body.gallery)
      : asStringArray(existing.gallery);

  try {
    const row = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: normalizeString(body.title) }),
        ...(body.slug !== undefined && { slug: nextSlug }),
        ...(body.summary !== undefined && { summary: normalizeString(body.summary) }),
        ...(body.content !== undefined && { content: normalizeString(body.content) }),
        ...(body.category !== undefined && { category: normalizeString(body.category) }),
        tags: nextTags,
        gallery: nextGallery,
        ...(body.coverImage !== undefined && {
          coverImage: normalizeString(body.coverImage),
        }),
        ...(body.githubUrl !== undefined && {
          githubUrl: normalizeString(body.githubUrl),
        }),
        ...(body.demoUrl !== undefined && { demoUrl: normalizeString(body.demoUrl) }),
        ...(body.featured !== undefined && { featured: Boolean(body.featured) }),
        ...(body.published !== undefined && { published: Boolean(body.published) }),
      },
    });
    return toDto(row);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && isUniqueConstraintOnSlug(e)) {
      throw new ProjectSlugTakenError(nextSlug);
    }
    throw e;
  }
}

export async function deleteProject(id: number): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
