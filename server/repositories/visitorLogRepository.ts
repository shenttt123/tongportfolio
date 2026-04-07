import { prisma } from "../db";

export type VisitorLogDto = {
  id: number;
  ip: string;
  path: string;
  createdAt: string;
};

function toDto(row: { id: number; ip: string; path: string; createdAt: Date }): VisitorLogDto {
  return {
    id: row.id,
    ip: row.ip,
    path: row.path,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function recordVisit(ip: string, path: string): Promise<void> {
  const p = path.length > 2048 ? path.slice(0, 2048) : path;
  await prisma.visitorLog.create({
    data: { ip, path: p },
  });
}

export async function listVisitorLogs(limit: number): Promise<VisitorLogDto[]> {
  const cap = Math.min(Math.max(1, limit), 2000);
  const rows = await prisma.visitorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: cap,
  });
  return rows.map(toDto);
}
