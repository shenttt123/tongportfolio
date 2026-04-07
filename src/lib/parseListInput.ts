/** Split tags or gallery URLs from a textarea (newlines or commas). */
export function parseListInput(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
