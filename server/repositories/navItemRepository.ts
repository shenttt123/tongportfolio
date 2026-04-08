import { prisma } from "../db";

export type NavItemDto = {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
  visible: boolean;
};

const DEFAULT_NAV_ITEMS: Omit<NavItemDto, "id">[] = [
  { key: "home",     label: "Home",     sortOrder: 0, visible: true },
  { key: "projects", label: "Projects", sortOrder: 1, visible: true },
  { key: "notes",    label: "Notes",    sortOrder: 2, visible: true },
  { key: "tools",    label: "Tools",    sortOrder: 3, visible: true },
  { key: "reading",  label: "Reading",  sortOrder: 4, visible: true },
  { key: "demos",    label: "Demos",    sortOrder: 5, visible: true },
  { key: "about",    label: "About",    sortOrder: 6, visible: true },
  { key: "contact",  label: "Contact",  sortOrder: 7, visible: true },
];

function toDto(row: { id: number; key: string; label: string; sortOrder: number; visible: boolean }): NavItemDto {
  return { id: row.id, key: row.key, label: row.label, sortOrder: row.sortOrder, visible: row.visible };
}

/** Seed defaults if the table is empty. */
async function ensureDefaults(): Promise<void> {
  const count = await prisma.navItem.count();
  if (count === 0) {
    await prisma.navItem.createMany({ data: DEFAULT_NAV_ITEMS });
  }
}

export async function listNavItems(visibleOnly = false): Promise<NavItemDto[]> {
  await ensureDefaults();
  const rows = await prisma.navItem.findMany({
    where: visibleOnly ? { visible: true } : {},
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toDto);
}

export type NavItemUpdate = {
  id: number;
  label?: string;
  sortOrder?: number;
  visible?: boolean;
};

/** Batch-update labels / order / visibility. Unknown ids are ignored. */
export async function updateNavItems(updates: NavItemUpdate[]): Promise<NavItemDto[]> {
  await Promise.all(
    updates.map(({ id, ...data }) =>
      prisma.navItem.update({ where: { id }, data })
    )
  );
  return listNavItems(false);
}
