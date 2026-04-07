import { prisma } from "../db";

export type ContactInquiryDto = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  createdAt: string;
};

function toDto(row: {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  createdAt: Date;
}): ContactInquiryDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    ip: row.ip,
    createdAt: row.createdAt.toISOString(),
  };
}

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_SUBJECT = 500;
const MAX_MESSAGE = 20000;

function clamp(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? t.slice(0, max) : t;
}

export async function createInquiry(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
}): Promise<ContactInquiryDto> {
  const name = clamp(input.name, MAX_NAME);
  const email = clamp(input.email, MAX_EMAIL);
  const subject = clamp(input.subject, MAX_SUBJECT);
  const message = clamp(input.message, MAX_MESSAGE);
  const ip = clamp(input.ip, 128);

  if (!name || !email || !message) {
    throw new Error("VALIDATION");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INVALID_EMAIL");
  }

  const row = await prisma.contactInquiry.create({
    data: { name, email, subject, message, ip },
  });
  return toDto(row);
}

export async function listInquiries(limit: number): Promise<ContactInquiryDto[]> {
  const cap = Math.min(Math.max(1, limit), 2000);
  const rows = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: cap,
  });
  return rows.map(toDto);
}
