import { useCallback, useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, RotateCcw } from "lucide-react";
import { formatApiError } from "../../lib/adminProjectsApi";
import { useAdminSaveFeedback } from "../../context/AdminSaveFeedbackContext";

type NavItemLocal = {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
  visible: boolean;
};

async function fetchNavItems(): Promise<NavItemLocal[]> {
  const res = await fetch("/api/admin/nav-items");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function saveNavItems(updates: { id: number; label: string; sortOrder: number; visible: boolean }[]) {
  const res = await fetch("/api/admin/nav-items", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error((data as { error?: string } | null)?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

const labelCls = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary mb-1";
const inputCls =
  "rounded border border-brand-border bg-brand-surface px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 w-32";

export function AdminNavPage() {
  const { notify } = useAdminSaveFeedback();
  const [items, setItems] = useState<NavItemLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const data = await fetchNavItems();
      setItems(data.slice().sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function moveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((item, i) => ({ ...item, sortOrder: i }));
    });
  }

  function moveDown(index: number) {
    setItems((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((item, i) => ({ ...item, sortOrder: i }));
    });
  }

  function toggleVisible(id: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item))
    );
  }

  function setLabel(id: number, label: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  }

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      const updated = await saveNavItems(
        items.map((item) => ({
          id: item.id,
          label: item.label,
          sortOrder: item.sortOrder,
          visible: item.visible,
        }))
      );
      setItems((updated as NavItemLocal[]).slice().sort((a, b) => a.sortOrder - b.sortOrder));
      notify(true, "Navigation saved.");
    } catch (e) {
      const msg = formatApiError(e);
      setErr(msg);
      notify(false, msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-xs font-mono text-brand-text-secondary animate-pulse">Loading…</p>;
  }

  const visibleCount = items.filter((i) => i.visible).length;

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-white mb-2">Navigation tabs</h1>
      <p className="text-sm text-brand-text-secondary mb-8">
        Control the order and visibility of public nav tabs. Hidden tabs still exist on the page —
        visitors just won't see them in the navbar.
      </p>

      {err && (
        <div className="mb-6 rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="rounded border border-brand-border overflow-hidden mb-6">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_7rem_5rem] gap-x-3 items-center px-4 py-2 bg-brand-surface/60 border-b border-brand-border text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary">
          <span>#</span>
          <span>Label</span>
          <span>Key</span>
          <span className="text-right">Visible</span>
        </div>

        {items.map((item, index) => (
          <div
            key={item.id}
            className={`grid grid-cols-[2rem_1fr_7rem_5rem] gap-x-3 items-center px-4 py-3 border-b border-brand-border/50 last:border-0 transition-colors ${
              item.visible ? "" : "opacity-50"
            }`}
          >
            {/* Order buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveUp(index)}
                className="text-brand-text-secondary hover:text-white disabled:opacity-20 transition-colors"
                aria-label="Move up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => moveDown(index)}
                className="text-brand-text-secondary hover:text-white disabled:opacity-20 transition-colors"
                aria-label="Move down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Label (editable) */}
            <input
              className={inputCls}
              value={item.label}
              onChange={(e) => setLabel(item.id, e.target.value)}
              aria-label={`Label for ${item.key}`}
            />

            {/* Key (readonly) */}
            <span className="text-xs font-mono text-brand-text-secondary truncate">{item.key}</span>

            {/* Visible toggle */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toggleVisible(item.id)}
                className={`transition-colors ${item.visible ? "text-white hover:text-brand-text-secondary" : "text-brand-text-secondary hover:text-white"}`}
                aria-pressed={item.visible}
                title={item.visible ? "Click to hide" : "Click to show"}
              >
                {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-brand-text-secondary">
          {visibleCount} of {items.length} tab{items.length !== 1 ? "s" : ""} visible
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setLoading(true); load(); }}
            className="flex items-center gap-1.5 rounded border border-brand-border px-3 py-1.5 text-xs text-brand-text-secondary hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
