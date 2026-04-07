import { useCallback, useEffect, useState } from "react";
import { adminContactInquiries, type ContactInquiryRow } from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

export function AdminContactInquiries() {
  const [rows, setRows] = useState<ContactInquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const data = await adminContactInquiries(1000);
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
          <h1 className="text-xl font-semibold text-white mb-2">Contact inquiries</h1>
          <p className="text-sm text-brand-text-secondary max-w-xl">
            Submissions from the public contact form (bottom of the site). IP is from the connection or{" "}
            <code className="text-xs bg-brand-surface px-1">X-Forwarded-For</code> behind nginx.
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brand-text-secondary text-sm">
                  No inquiries yet. Submit the form on the public site contact section.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-brand-border/60 last:border-0 align-top hover:bg-brand-surface/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-text-secondary whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-white max-w-[10rem] break-words">{r.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-text-secondary break-all max-w-[14rem]">
                    {r.email}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-brand-text-secondary max-w-[12rem] break-words">
                    {r.subject || "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-white whitespace-nowrap">{r.ip || "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-brand-text-secondary max-w-[min(28rem,40vw)]">
                    <button
                      type="button"
                      className="text-left w-full text-brand-text-secondary hover:text-white transition-colors"
                      onClick={() => setExpanded((prev) => (prev === r.id ? null : r.id))}
                    >
                      {expanded === r.id ? (
                        <span className="whitespace-pre-wrap break-words">{r.message}</span>
                      ) : (
                        <span className="line-clamp-2">{r.message}</span>
                      )}
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
