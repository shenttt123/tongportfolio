import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { asStringArray } from "../lib/json";

export type StackGroup = { category: string; items: string[] };
export type ContactBlock = {
  email: string;
  location: string;
  github: string;
  linkedin: string;
};

export type ExperienceDto = {
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

function parseStack(value: unknown): StackGroup[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => {
      if (x && typeof x === "object" && "category" in x) {
        const category = String((x as { category: unknown }).category ?? "");
        const items = asStringArray((x as { items?: unknown }).items);
        return { category, items };
      }
      return null;
    })
    .filter((x): x is StackGroup => x !== null && x.category.length > 0);
}

function parseContact(value: unknown): ContactBlock {
  if (!value || typeof value !== "object") {
    return { email: "", location: "", github: "", linkedin: "" };
  }
  const o = value as Record<string, unknown>;
  return {
    email: String(o.email ?? ""),
    location: String(o.location ?? ""),
    github: String(o.github ?? ""),
    linkedin: String(o.linkedin ?? ""),
  };
}

function experienceToDto(row: {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
  bullets: unknown;
  sortOrder: number;
}): ExperienceDto {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    startDate: row.startDate,
    endDate: row.endDate,
    location: row.location,
    summary: row.summary,
    bullets: asStringArray(row.bullets),
    sortOrder: row.sortOrder,
  };
}

function experienceToPublic(e: ExperienceDto) {
  const period =
    e.endDate.trim() === ""
      ? `${e.startDate} — Present`
      : `${e.startDate} — ${e.endDate}`;
  const bulletBlock = e.bullets.length ? "\n\n" + e.bullets.map((b) => `• ${b}`).join("\n") : "";
  return {
    company: e.company,
    role: e.role,
    period,
    description: (e.summary + bulletBlock).trim() || e.summary,
  };
}

export async function getAboutPageRow() {
  let row = await prisma.aboutPage.findUnique({ where: { id: 1 } });
  if (!row) {
    row = await prisma.aboutPage.create({
      data: {
        id: 1,
        bio: "",
        currentFocus: [],
        stack: [],
        contact: {},
      },
    });
  }
  return row;
}

/** Public /api/about JSON — matches AboutContent in frontend types. */
export async function getPublicAboutContent() {
  const row = await getAboutPageRow();
  const experiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return {
    bio: row.bio,
    currentFocus: asStringArray(row.currentFocus),
    experience: experiences.map((ex) => experienceToPublic(experienceToDto(ex))),
    stack: parseStack(row.stack),
    contact: parseContact(row.contact),
  };
}

export type AdminAboutBundle = {
  bio: string;
  currentFocus: string[];
  stack: StackGroup[];
  contact: ContactBlock;
  experiences: ExperienceDto[];
};

export async function getAdminAboutBundle(): Promise<AdminAboutBundle> {
  const row = await getAboutPageRow();
  const experiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return {
    bio: row.bio,
    currentFocus: asStringArray(row.currentFocus),
    stack: parseStack(row.stack),
    contact: parseContact(row.contact),
    experiences: experiences.map((ex) => experienceToDto(ex)),
  };
}

export async function updateAboutPage(body: Record<string, unknown>): Promise<AdminAboutBundle> {
  await getAboutPageRow();
  const data: Prisma.AboutPageUpdateInput = {};
  if (body.bio !== undefined) data.bio = String(body.bio);
  if (body.currentFocus !== undefined) {
    data.currentFocus = asStringArray(body.currentFocus);
  }
  if (body.stack !== undefined) data.stack = parseStack(body.stack);
  if (body.contact !== undefined) data.contact = parseContact(body.contact);
  if (Object.keys(data).length === 0) {
    return getAdminAboutBundle();
  }
  await prisma.aboutPage.update({
    where: { id: 1 },
    data,
  });
  return getAdminAboutBundle();
}

export async function listExperiences(): Promise<ExperienceDto[]> {
  const rows = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return rows.map(experienceToDto);
}

export async function getExperienceById(id: number): Promise<ExperienceDto | null> {
  const row = await prisma.experience.findUnique({ where: { id } });
  return row ? experienceToDto(row) : null;
}

export async function createExperience(
  body: Record<string, unknown>
): Promise<ExperienceDto> {
  const row = await prisma.experience.create({
    data: {
      company: String(body.company ?? ""),
      role: String(body.role ?? ""),
      startDate: String(body.startDate ?? ""),
      endDate: String(body.endDate ?? ""),
      location: String(body.location ?? ""),
      summary: String(body.summary ?? ""),
      bullets: asStringArray(body.bullets),
      sortOrder:
        body.sortOrder !== undefined ? parseInt(String(body.sortOrder), 10) || 0 : 0,
    },
  });
  return experienceToDto(row);
}

export async function updateExperience(
  id: number,
  body: Record<string, unknown>
): Promise<ExperienceDto | null> {
  const existing = await prisma.experience.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.experience.update({
    where: { id },
    data: {
      ...(body.company !== undefined && { company: String(body.company) }),
      ...(body.role !== undefined && { role: String(body.role) }),
      ...(body.startDate !== undefined && { startDate: String(body.startDate) }),
      ...(body.endDate !== undefined && { endDate: String(body.endDate) }),
      ...(body.location !== undefined && { location: String(body.location) }),
      ...(body.summary !== undefined && { summary: String(body.summary) }),
      ...(body.bullets !== undefined && { bullets: asStringArray(body.bullets) }),
      ...(body.sortOrder !== undefined && {
        sortOrder: parseInt(String(body.sortOrder), 10) || 0,
      }),
    },
  });
  return experienceToDto(row);
}

export async function deleteExperience(id: number): Promise<boolean> {
  try {
    await prisma.experience.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
