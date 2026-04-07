import { prisma } from "../db";

export type ReadingDto = {
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

const ALLOWED_TYPES = new Set(["reading", "completed", "queued"]);

function toDto(row: {
  id: number;
  title: string;
  type: string;
  author: string;
  link: string;
  summary: string;
  category: string;
  recommended: boolean;
  sortOrder: number;
}): ReadingDto {
  return {
    id: row.id,
    title: row.title,
    type: ALLOWED_TYPES.has(row.type) ? row.type : "reading",
    author: row.author,
    link: row.link,
    summary: row.summary,
    category: row.category,
    recommended: row.recommended,
    sortOrder: row.sortOrder,
  };
}

/** Public ReadingItem shape (status from type). */
export function readingToPublic(r: ReadingDto) {
  const status = r.type as "reading" | "completed" | "queued";
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    category: r.category,
    status,
    link: r.link || undefined,
    review: r.summary || undefined,
    rating: r.recommended ? 5 : undefined,
  };
}

export async function listPublicReading(): Promise<ReturnType<typeof readingToPublic>[]> {
  const rows = await prisma.readingItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return rows.map((row) => readingToPublic(toDto(row)));
}

export async function listAllReading(): Promise<ReadingDto[]> {
  const rows = await prisma.readingItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return rows.map(toDto);
}

export async function getReadingById(id: number): Promise<ReadingDto | null> {
  const row = await prisma.readingItem.findUnique({ where: { id } });
  return row ? toDto(row) : null;
}

export async function createReading(body: Record<string, unknown>): Promise<ReadingDto> {
  const type = String(body.type ?? "reading");
  const row = await prisma.readingItem.create({
    data: {
      title: String(body.title ?? ""),
      type: ALLOWED_TYPES.has(type) ? type : "reading",
      author: String(body.author ?? ""),
      link: String(body.link ?? ""),
      summary: String(body.summary ?? ""),
      category: String(body.category ?? ""),
      recommended: Boolean(body.recommended),
      sortOrder:
        body.sortOrder !== undefined ? parseInt(String(body.sortOrder), 10) || 0 : 0,
    },
  });
  return toDto(row);
}

export async function updateReading(
  id: number,
  body: Record<string, unknown>
): Promise<ReadingDto | null> {
  const existing = await prisma.readingItem.findUnique({ where: { id } });
  if (!existing) return null;
  const type =
    body.type !== undefined ? String(body.type) : existing.type;
  const row = await prisma.readingItem.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.type !== undefined && {
        type: ALLOWED_TYPES.has(type) ? type : existing.type,
      }),
      ...(body.author !== undefined && { author: String(body.author) }),
      ...(body.link !== undefined && { link: String(body.link) }),
      ...(body.summary !== undefined && { summary: String(body.summary) }),
      ...(body.category !== undefined && { category: String(body.category) }),
      ...(body.recommended !== undefined && { recommended: Boolean(body.recommended) }),
      ...(body.sortOrder !== undefined && {
        sortOrder: parseInt(String(body.sortOrder), 10) || 0,
      }),
    },
  });
  return toDto(row);
}

export async function deleteReading(id: number): Promise<boolean> {
  try {
    await prisma.readingItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
