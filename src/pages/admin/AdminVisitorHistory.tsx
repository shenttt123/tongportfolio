import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  adminVisitorLogs,
  adminDeleteVisitorLogsByIds,
  adminDeleteVisitorLogsByIp,
  type VisitorLogRow,
} from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

const btn =
  "rounded border px-3 py-1.5 text-xs transition-colors disabled:opacity-40";
const btnGhost =
  `${btn} border-brand-border text-white hover:bg-brand-surface`;
const btnDanger =
  `${btn} border-red-800/60 bg-red-950/40 text-red-200 hover:bg-red-950/70`;

export function AdminVisitorHistory() {
  const [rows, setRows] = useState<VisitorLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* IP filter */
  const [ipFilter, setIpFilter] = useState("");

  /* selection */
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setErr(null);
    setSelected(new Set());
    try {
      const data = await adminVisitorLogs(2000);
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

  /* rows that pass the IP filter */
  const filtered = useMemo(() => {
    const q = ipFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.ip.toLowerCase().includes(q));
  }, [rows, ipFilter]);

  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered]);

  /* — selection helpers — */
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  /* — delete helpers — */
  async function deleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected record(s)?`)) return;
    setDeleting(true);
    setErr(null);
    try {
      const { deleted } = await adminDeleteVisitorLogsByIds(ids);
      setRows((prev) => prev.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
      if (deleted === 0) setErr("Nothing was deleted (rows may have been removed already).");
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setDeleting(false);
    }
  }

  async function deleteByIp(ip: string) {
    const count = rows.filter((r) => r.ip === ip).length;
    if (!confirm(`Delete all ${count} record(s) from IP ${ip}?`)) return;
    setDeleting(true);
    setErr(null);
    try {
      await adminDeleteVisitorLogsByIp(ip);
      setRows((prev) => prev.filter((r) => r.ip !== ip));
      setSelected((prev) => {
        const next = new Set(prev);
        rows.filter((r) => r.ip === ip).forEach((r) => next.delete(r.id));
        return next;
      });
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setDeleting(false);
    }
  }


  const ipFilterRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return <p className="text-xs font-mono text-brand-text-secondary animate-pulse">Loading…</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Visitor history</h1>
          <p className="text-sm text-brand-text-secondary max-w-xl">
            SPA route changes (path + server time + IP). IP comes from the TCP connection or{" "}
            <code className="text-xs bg-brand-surface px-1">X-Forwarded-For</code> when behind nginx
            (Express uses <code className="text-xs bg-brand-surface px-1">trust proxy</code>).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            disabled={deleting}
            onClick={() => { setLoading(true); load(); }}
            className={btnGhost}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Toolbar: filter + bulk delete */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          ref={ipFilterRef}
          type="text"
          value={ipFilter}
          onChange={(e) => { setIpFilter(e.target.value); setSelected(new Set()); }}
          placeholder="Filter by IP…"
          className="rounded border border-brand-border bg-brand-surface px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 w-48"
        />
        {ipFilter && (
          <button
            type="button"
            onClick={() => { setIpFilter(""); setSelected(new Set()); ipFilterRef.current?.focus(); }}
            className="text-xs text-brand-text-secondary hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
        <span className="text-xs text-brand-text-secondary ml-auto">
          {filtered.length} row{filtered.length !== 1 ? "s" : ""}
          {ipFilter ? " (filtered)" : ""}
          {someSelected ? `, ${selected.size} selected` : ""}
        </span>
        {someSelected && (
          <button
            type="button"
            disabled={deleting}
            onClick={deleteSelected}
            className={btnDanger}
          >
            <Trash2 className="inline w-3 h-3 mr-1 -mt-px" />
            Delete {selected.size} selected
          </button>
        )}
      </div>

      {err && (
        <div className="mb-4 rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="overflow-x-auto rounded border border-brand-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface/40 text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all visible rows"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllFiltered}
                  disabled={filteredIds.length === 0}
                  className="accent-white cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Path</th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-brand-text-secondary text-sm">
                  {rows.length === 0
                    ? "No visits recorded yet. Browse the site or open /admin, then refresh."
                    : "No rows match the current IP filter."}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-brand-border/60 last:border-0 transition-colors ${
                    selected.has(r.id)
                      ? "bg-brand-surface/40"
                      : "hover:bg-brand-surface/20"
                  }`}
                >
                  <td className="px-3 py-2.5 w-8">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${r.id}`}
                      checked={selected.has(r.id)}
                      onChange={() => toggleRow(r.id)}
                      className="accent-white cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-text-secondary whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-white whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => { setIpFilter(r.ip); setSelected(new Set()); }}
                      className="hover:underline hover:text-brand-text-secondary transition-colors"
                      title={`Filter by ${r.ip}`}
                    >
                      {r.ip}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-text-secondary break-all max-w-md">
                    {r.path || "/"}
                  </td>
                  <td className="px-3 py-2.5 w-8">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => deleteByIp(r.ip)}
                      className="text-brand-text-secondary hover:text-red-300 transition-colors disabled:opacity-40"
                      title={`Delete all rows for ${r.ip}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
