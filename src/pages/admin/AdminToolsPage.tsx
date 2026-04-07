import { useCallback, useEffect, useState } from "react";
import { useAdminSaveFeedback } from "../../context/AdminSaveFeedbackContext";
import { adminTools, type ToolAdmin, parseListInput } from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

const input =
  "w-full rounded border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30";
const label = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary mb-1";

const empty: Omit<ToolAdmin, "id"> = {
  title: "",
  category: "",
  description: "",
  link: "",
  tags: [],
  published: true,
  sortOrder: 0,
};

export function AdminToolsPage() {
  const { notify } = useAdminSaveFeedback();
  const [list, setList] = useState<ToolAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ToolAdmin, "id"> & { id?: number }>(empty);
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      setList(await adminTools.list());
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function edit(t: ToolAdmin) {
    setForm({ ...t });
    setTagsText(t.tags.join("\n"));
  }

  function clearForm() {
    setForm(empty);
    setTagsText("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const body = { ...form, tags: parseListInput(tagsText) };
      delete (body as { id?: number }).id;
      if (form.id) await adminTools.update(form.id, body);
      else await adminTools.create(body);
      await load();
      clearForm();
      notify(true, form.id ? "Tool updated." : "Tool created.");
    } catch (e) {
      const msg = formatApiError(e);
      setErr(msg);
      notify(false, msg);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    if (!window.confirm("Delete this tool?")) return;
    try {
      await adminTools.delete(id);
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
          <h1 className="text-xl font-semibold text-white">Tools</h1>
          <button type="button" onClick={clearForm} className="text-xs text-brand-text-secondary hover:text-white">
            + New
          </button>
        </div>
        {err && (
          <div className="rounded border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-200 mb-2">{err}</div>
        )}
        <ul className="space-y-1 border border-brand-border rounded divide-y divide-brand-border">
          {list.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-brand-surface/40">
              <button type="button" onClick={() => edit(t)} className="text-left text-sm flex-1 truncate">
                {t.title}
              </button>
              <span className="text-[10px] text-brand-text-secondary">{t.sortOrder}</span>
              <button type="button" onClick={() => del(t.id)} className="text-xs text-red-400">
                Del
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="flex-1 space-y-4 max-w-xl">
        <h2 className="text-sm font-mono uppercase tracking-widest text-brand-text-secondary">
          {form.id ? `Edit #${form.id}` : "Create tool"}
        </h2>
        <div>
          <label className={label}>Title</label>
          <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className={label}>Category</label>
          <input className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea className={`${input} min-h-[80px]`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className={label}>Link</label>
          <input className={input} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <div>
          <label className={label}>Tags</label>
          <textarea className={`${input} min-h-[50px] text-xs`} value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
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
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published
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
