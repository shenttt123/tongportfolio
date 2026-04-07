import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** GitHub URL from CMS: full URL, `github.com/...`, or username. */
export function githubUrlFromField(raw: string): string {
  const s = raw.trim();
  if (!s) return "https://github.com";
  if (/^https?:\/\//i.test(s)) return s;
  const path = s.replace(/^\/+/, "");
  if (path.includes("github.com")) return `https://${path}`;
  return `https://github.com/${path}`;
}

/** LinkedIn URL from CMS: full URL, `linkedin.com/...`, or profile slug. */
export function linkedinUrlFromField(raw: string): string {
  const s = raw.trim();
  if (!s) return "https://www.linkedin.com";
  if (/^https?:\/\//i.test(s)) return s;
  const path = s.replace(/^\/+/, "");
  if (path.includes("linkedin.com")) return `https://${path}`;
  return `https://www.linkedin.com/in/${path}`;
}

/** Host + path without protocol, for compact labels. */
export function displayUrlWithoutProtocol(url: string): string {
  const s = url.trim();
  if (!s) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s.replace(/^\/+/, "")}`);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/$/, "");
    return path ? `${host}${path}` : host;
  } catch {
    return s;
  }
}
