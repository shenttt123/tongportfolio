import { prisma } from "../db";
import { asStringArray } from "../lib/json";

export type ToolDto = {
  id: number;
  title: string;
  category: string;
  description: string;
  link: string;
  tags: string[];
  published: boolean;
  sortOrder: number;
};

function toDto(row: {
  id: number;
  title: string;
  category: string;
  description: string;
  link: string;
  tags: unknown;
  published: boolean;
  sortOrder: number;
}): ToolDto {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    link: row.link,
    tags: asStringArray(row.tags),
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

/** Public shape: `name` alias for title (frontend Tool type). */
export function toolToPublic(t: ToolDto) {
  return {
    id: t.id,
    name: t.title,
    category: t.category,
    description: t.description,
    link: t.link || undefined,
    tags: t.tags.length ? t.tags : undefined,
  };
}

export async function listPublicTools(): Promise<ReturnType<typeof toolToPublic>[]> {
  const rows = await prisma.tool.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return rows.map((r) => toolToPublic(toDto(r)));
}

export async function listAllTools(): Promise<ToolDto[]> {
  const rows = await prisma.tool.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return rows.map(toDto);
}

export async function getToolById(id: number): Promise<ToolDto | null> {
  const row = await prisma.tool.findUnique({ where: { id } });
  return row ? toDto(row) : null;
}

export async function createTool(body: Record<string, unknown>): Promise<ToolDto> {
  const row = await prisma.tool.create({
    data: {
      title: String(body.title ?? ""),
      category: String(body.category ?? ""),
      description: String(body.description ?? ""),
      link: String(body.link ?? ""),
      tags: asStringArray(body.tags),
      published: body.published !== undefined ? Boolean(body.published) : true,
      sortOrder:
        body.sortOrder !== undefined ? parseInt(String(body.sortOrder), 10) || 0 : 0,
    },
  });
  return toDto(row);
}

export async function updateTool(
  id: number,
  body: Record<string, unknown>
): Promise<ToolDto | null> {
  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.tool.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.category !== undefined && { category: String(body.category) }),
      ...(body.description !== undefined && { description: String(body.description) }),
      ...(body.link !== undefined && { link: String(body.link) }),
      ...(body.tags !== undefined && { tags: asStringArray(body.tags) }),
      ...(body.published !== undefined && { published: Boolean(body.published) }),
      ...(body.sortOrder !== undefined && {
        sortOrder: parseInt(String(body.sortOrder), 10) || 0,
      }),
    },
  });
  return toDto(row);
}

export async function deleteTool(id: number): Promise<boolean> {
  try {
    await prisma.tool.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
