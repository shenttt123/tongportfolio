import { useCallback, useEffect, useState } from "react";
import { adminVisitorLogs, type VisitorLogRow } from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

export function AdminVisitorHistory() {
  const [rows, setRows] = useState<VisitorLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const data = await adminVisitorLogs(1000);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-xs font-mono text-brand-text-secondary animate-pulse">Loading…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Visitor history</h1>
          <p className="text-sm text-brand-text-secondary max-w-xl">
            SPA route changes (path + server time + IP). IP comes from the TCP connection or{" "}
            <code className="text-xs bg-brand-surface px-1">X-Forwarded-For</code> when behind nginx
            (Express uses <code className="text-xs bg-brand-surface px-1">trust proxy</code>).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="rounded border border-brand-border px-3 py-1.5 text-xs text-white hover:bg-brand-surface transition-colors"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="mb-6 rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="overflow-x-auto rounded border border-brand-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface/40 text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Path</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-brand-text-secondary text-sm">
                  No visits recorded yet. Browse the site or open /admin, then refresh.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-brand-border/60 last:border-0 hover:bg-brand-surface/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-text-secondary whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-white whitespace-nowrap">
                    {r.ip}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-text-secondary break-all max-w-md">
                    {r.path || "/"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
