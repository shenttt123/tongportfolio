import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { asStringArray } from "../lib/json";

export type SiteHomeDto = {
  id: number;
  portraitImagePath: string;
  shortIntro: string;
  heroText: string;
  technicalFocusTags: string[];
  contactPreviewLinks: { label: string; url: string }[];
};

function normalizePreviewLinks(value: unknown): { label: string; url: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => {
      if (x && typeof x === "object" && "label" in x && "url" in x) {
        return {
          label: String((x as { label: unknown }).label ?? ""),
          url: String((x as { url: unknown }).url ?? ""),
        };
      }
      return null;
    })
    .filter((x): x is { label: string; url: string } => x !== null);
}

function toDto(row: {
  id: number;
  portraitImagePath: string;
  shortIntro: string;
  heroText: string;
  technicalFocusTags: unknown;
  contactPreviewLinks: unknown;
}): SiteHomeDto {
  return {
    id: row.id,
    portraitImagePath: row.portraitImagePath,
    shortIntro: row.shortIntro,
    heroText: row.heroText,
    technicalFocusTags: asStringArray(row.technicalFocusTags),
    contactPreviewLinks: normalizePreviewLinks(row.contactPreviewLinks),
  };
}

export async function getSiteHome(): Promise<SiteHomeDto> {
  let row = await prisma.siteHome.findUnique({ where: { id: 1 } });
  if (!row) {
    row = await prisma.siteHome.create({
      data: {
        id: 1,
        technicalFocusTags: [],
        contactPreviewLinks: [],
      },
    });
  }
  return toDto(row);
}

export async function updateSiteHome(
  body: Record<string, unknown>
): Promise<SiteHomeDto> {
  await getSiteHome();
  const data: Prisma.SiteHomeUpdateInput = {};
  if (body.portraitImagePath !== undefined) {
    data.portraitImagePath = String(body.portraitImagePath);
  }
  if (body.shortIntro !== undefined) data.shortIntro = String(body.shortIntro);
  if (body.heroText !== undefined) data.heroText = String(body.heroText);
  if (body.technicalFocusTags !== undefined) {
    data.technicalFocusTags = asStringArray(body.technicalFocusTags);
  }
  if (body.contactPreviewLinks !== undefined) {
    data.contactPreviewLinks = normalizePreviewLinks(body.contactPreviewLinks);
  }
  if (Object.keys(data).length === 0) {
    return getSiteHome();
  }
  const row = await prisma.siteHome.update({
    where: { id: 1 },
    data,
  });
  return toDto(row);
}
