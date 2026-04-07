import { prisma } from "../db";
import { asStringArray } from "../lib/json";

export type NoteDto = {
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

function toDto(row: {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: unknown;
  date: string;
  readTime: string;
  published: boolean;
}): NoteDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    category: row.category,
    tags: asStringArray(row.tags),
    date: row.date,
    readTime: row.readTime,
    published: row.published,
  };
}

export async function listPublishedNotes(): Promise<NoteDto[]> {
  const rows = await prisma.note.findMany({
    where: { published: true },
    orderBy: { id: "asc" },
  });
  return rows.map(toDto);
}

export async function getPublishedNoteBySlug(slug: string): Promise<NoteDto | null> {
  const row = await prisma.note.findFirst({ where: { slug, published: true } });
  return row ? toDto(row) : null;
}

export async function listAllNotes(): Promise<NoteDto[]> {
  const rows = await prisma.note.findMany({ orderBy: { id: "asc" } });
  return rows.map(toDto);
}

export async function getNoteById(id: number): Promise<NoteDto | null> {
  const row = await prisma.note.findUnique({ where: { id } });
  return row ? toDto(row) : null;
}

export async function createNote(body: Record<string, unknown>): Promise<NoteDto> {
  const row = await prisma.note.create({
    data: {
      title: String(body.title ?? ""),
      slug: String(body.slug ?? ""),
      summary: String(body.summary ?? ""),
      content: String(body.content ?? ""),
      category: String(body.category ?? ""),
      tags: asStringArray(body.tags),
      date: String(body.date ?? ""),
      readTime: String(body.readTime ?? ""),
      published: body.published !== undefined ? Boolean(body.published) : true,
    },
  });
  return toDto(row);
}

export async function updateNote(
  id: number,
  body: Record<string, unknown>
): Promise<NoteDto | null> {
  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.note.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.slug !== undefined && { slug: String(body.slug) }),
      ...(body.summary !== undefined && { summary: String(body.summary) }),
      ...(body.content !== undefined && { content: String(body.content) }),
      ...(body.category !== undefined && { category: String(body.category) }),
      ...(body.tags !== undefined && { tags: asStringArray(body.tags) }),
      ...(body.date !== undefined && { date: String(body.date) }),
      ...(body.readTime !== undefined && { readTime: String(body.readTime) }),
      ...(body.published !== undefined && { published: Boolean(body.published) }),
    },
  });
  return toDto(row);
}

export async function deleteNote(id: number): Promise<boolean> {
  try {
    await prisma.note.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
