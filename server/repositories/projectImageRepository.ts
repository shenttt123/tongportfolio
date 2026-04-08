import fs from "fs";
import path from "path";
import { prisma } from "../db";

export type ProjectImageDto = {
  id: number;
  projectId: number | null;
  url: string;
  filename: string;
  label: string;
  createdAt: string;
};

function toDto(row: {
  id: number;
  projectId: number | null;
  url: string;
  filename: string;
  label: string;
  createdAt: Date;
}): ProjectImageDto {
  return {
    id: row.id,
    projectId: row.projectId,
    url: row.url,
    filename: row.filename,
    label: row.label,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createProjectImage(input: {
  projectId?: number | null;
  url: string;
  filename: string;
  label?: string;
}): Promise<ProjectImageDto> {
  const row = await prisma.projectImage.create({
    data: {
      projectId: input.projectId ?? null,
      url: input.url,
      filename: input.filename,
      label: input.label ?? "",
    },
  });
  return toDto(row);
}

export async function listProjectImages(projectId?: number | null): Promise<ProjectImageDto[]> {
  const where = projectId != null ? { projectId } : {};
  const rows = await prisma.projectImage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 2000,
  });
  return rows.map(toDto);
}

export async function listAllProjectImages(): Promise<ProjectImageDto[]> {
  const rows = await prisma.projectImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 2000,
  });
  return rows.map(toDto);
}

export async function updateProjectImageLabel(id: number, label: string): Promise<ProjectImageDto | null> {
  try {
    const row = await prisma.projectImage.update({ where: { id }, data: { label } });
    return toDto(row);
  } catch {
    return null;
  }
}

export async function deleteProjectImage(
  id: number,
  uploadsRoot: string
): Promise<boolean> {
  const row = await prisma.projectImage.findUnique({ where: { id } });
  if (!row) return false;
  await prisma.projectImage.delete({ where: { id } });
  if (row.filename) {
    const filepath = path.join(uploadsRoot, row.filename);
    try { fs.unlinkSync(filepath); } catch { /* file may already be gone */ }
  }
  return true;
}

export async function deleteProjectImages(
  ids: number[],
  uploadsRoot: string
): Promise<number> {
  if (ids.length === 0) return 0;
  const rows = await prisma.projectImage.findMany({ where: { id: { in: ids } } });
  await prisma.projectImage.deleteMany({ where: { id: { in: ids } } });
  for (const row of rows) {
    if (row.filename) {
      const filepath = path.join(uploadsRoot, row.filename);
      try { fs.unlinkSync(filepath); } catch { /* ignore */ }
    }
  }
  return rows.length;
}

export type ImageUsageInfo = {
  imageId: number;
  url: string;
  usedIn: { projectId: number; projectTitle: string; field: "coverImage" | "gallery" }[];
};

/**
 * For each id, check whether the corresponding URL appears in any project's
 * coverImage or gallery fields. Returns only images that are actually in use.
 */
export async function checkImageUsage(ids: number[]): Promise<ImageUsageInfo[]> {
  if (ids.length === 0) return [];
  const images = await prisma.projectImage.findMany({ where: { id: { in: ids } } });
  if (images.length === 0) return [];

  const projects = await prisma.project.findMany({
    select: { id: true, title: true, coverImage: true, gallery: true },
  });

  const result: ImageUsageInfo[] = [];

  for (const img of images) {
    const usedIn: ImageUsageInfo["usedIn"] = [];
    for (const p of projects) {
      if (p.coverImage === img.url) {
        usedIn.push({ projectId: p.id, projectTitle: p.title, field: "coverImage" });
      }
      const gallery = Array.isArray(p.gallery) ? (p.gallery as string[]) : [];
      if (gallery.includes(img.url)) {
        usedIn.push({ projectId: p.id, projectTitle: p.title, field: "gallery" });
      }
    }
    if (usedIn.length > 0) {
      result.push({ imageId: img.id, url: img.url, usedIn });
    }
  }
  return result;
}
