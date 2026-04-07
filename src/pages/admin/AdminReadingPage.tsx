import { useCallback, useEffect, useState } from "react";
import { useAdminSaveFeedback } from "../../context/AdminSaveFeedbackContext";
import { adminReading, type ReadingAdmin } from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

const input =
  "w-full rounded border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30";
const label = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary mb-1";

const empty: Omit<ReadingAdmin, "id"> = {
  title: "",
  type: "reading",
  author: "",
  link: "",
  summary: "",
  category: "",
  recommended: false,
  sortOrder: 0,
};

export function AdminReadingPage() {
  const { notify } = useAdminSaveFeedback();
  const [list, setList] = useState<ReadingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ReadingAdmin, "id"> & { id?: number }>(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      setList(await adminReading.list());
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function edit(r: ReadingAdmin) {
    setForm({ ...r });
  }

  function clearForm() {
    setForm(empty);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const body = { ...form };
      delete (body as { id?: number }).id;
      if (form.id) await adminReading.update(form.id, body);
      else await adminReading.create(body);
      await load();
      clearForm();
      notify(true, form.id ? "Reading item updated." : "Reading item created.");
    } catch (e) {
      const msg = formatApiError(e);
      setErr(msg);
      notify(false, msg);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    if (!window.confirm("Delete this item?")) return;
    try {
      await adminReading.delete(id);
      await load();
      if (form.id === id) clearForm();
    } catch (e) {
      alert(formatApiError(e));
    }
  }

  if (loading) {
    return <p className="text-xs font-mono text-brand-text-secondary animate-pulse">Loading…</p>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="lg:w-2/5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-white">Reading</h1>
          <button type="button" onClick={clearForm} className="text-xs text-brand-text-secondary hover:text-white">
            + New
          </button>
        </div>
        {err && (
          <div className="rounded border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-200 mb-2">{err}</div>
        )}
        <ul className="space-y-1 border border-brand-border rounded divide-y divide-brand-border">
          {list.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-brand-surface/40">
              <button type="button" onClick={() => edit(r)} className="text-left text-sm flex-1 truncate">
                {r.title}
              </button>
              <span className="text-[10px] text-brand-text-secondary">{r.type}</span>
              <button type="button" onClick={() => del(r.id)} className="text-xs text-red-400">
                Del
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="flex-1 space-y-4 max-w-xl">
        <h2 className="text-sm font-mono uppercase tracking-widest text-brand-text-secondary">
          {form.id ? `Edit #${form.id}` : "Create item"}
        </h2>
        <div>
          <label className={label}>Title</label>
          <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className={label}>Type (status)</label>
          <select
            className={input}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="reading">reading</option>
            <option value="completed">completed</option>
            <option value="queued">queued</option>
          </select>
        </div>
        <div>
          <label className={label}>Author</label>
          <input className={input} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </div>
        <div>
          <label className={label}>Category</label>
          <input className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className={label}>Link</label>
          <input className={input} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <div>
          <label className={label}>Summary (shown as review on public cards when set)</label>
          <textarea className={`${input} min-h-[70px]`} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Sort order</label>
            <input
              type="number"
              className={input}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <label className="flex items-end gap-2 text-sm text-brand-text-secondary pb-2">
            <input
              type="checkbox"
              checked={form.recommended}
              onChange={(e) => setForm({ ...form, recommended: e.target.checked })}
            />
            Recommended (5★)
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded border border-white/20 bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
