/**
 * Public list APIs must return JSON arrays. On 5xx or wrong shape, return [] so UI never calls .filter on { error }.
 */
export async function fetchJsonList<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url);
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`[fetchJsonList] ${url} HTTP ${res.status}`, data);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error(`[fetchJsonList] ${url} expected array, got:`, typeof data, data);
      return [];
    }
    return data as T[];
  } catch (e) {
    console.error(`[fetchJsonList] ${url}`, e);
    return [];
  }
}
