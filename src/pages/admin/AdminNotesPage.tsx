import { useCallback, useEffect, useState } from "react";
import { useAdminSaveFeedback } from "../../context/AdminSaveFeedbackContext";
import { adminNotes, type NoteAdmin, parseListInput } from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

const input =
  "w-full rounded border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30";
const label = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary mb-1";

const empty: Omit<NoteAdmin, "id"> = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "",
  tags: [],
  date: "",
  readTime: "",
  published: true,
};

export function AdminNotesPage() {
  const { notify } = useAdminSaveFeedback();
  const [list, setList] = useState<NoteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<NoteAdmin, "id"> & { id?: number }>(empty);
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      setList(await adminNotes.list());
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function edit(n: NoteAdmin) {
    setForm({ ...n });
    setTagsText(n.tags.join("\n"));
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
      const body = {
        ...form,
        tags: parseListInput(tagsText),
      };
      delete (body as { id?: number }).id;
      if (form.id) {
        await adminNotes.update(form.id, body);
      } else {
        await adminNotes.create(body);
      }
      await load();
      clearForm();
      notify(true, form.id ? "Note updated." : "Note created.");
    } catch (e) {
      const msg = formatApiError(e);
      setErr(msg);
      notify(false, msg);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await adminNotes.delete(id);
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
      <div className="lg:w-2/5 space-y-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-white">Notes</h1>
          <button
            type="button"
            onClick={clearForm}
            className="text-xs text-brand-text-secondary hover:text-white"
          >
            + New
          </button>
        </div>
        {err && (
          <div className="rounded border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-200 mb-2">
            {err}
          </div>
        )}
        <ul className="space-y-1 border border-brand-border rounded divide-y divide-brand-border">
          {list.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-brand-surface/40">
              <button
                type="button"
                onClick={() => edit(n)}
                className="text-left text-sm text-white hover:underline flex-1 truncate"
              >
                {n.title}
              </button>
              <button
                type="button"
                onClick={() => del(n.id)}
                className="text-xs text-red-400 shrink-0"
              >
                Del
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="flex-1 space-y-4 max-w-xl">
        <h2 className="text-sm font-mono uppercase tracking-widest text-brand-text-secondary">
          {form.id ? `Edit #${form.id}` : "Create note"}
        </h2>
        <div>
          <label className={label}>Title</label>
          <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className={label}>Slug</label>
          <input className={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </div>
        <div>
          <label className={label}>Category</label>
          <input className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className={label}>Summary</label>
          <textarea className={`${input} min-h-[60px]`} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </div>
        <div>
          <label className={label}>Content</label>
          <textarea className={`${input} min-h-[120px] font-mono text-xs`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Date</label>
            <input className={input} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className={label}>Read time</label>
            <input className={input} value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={label}>Tags (lines / commas)</label>
          <textarea className={`${input} min-h-[60px] text-xs`} value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-text-secondary">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published
        </label>
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
