import { useCallback, useEffect, useState } from "react";
import {
  adminAbout,
  adminExperiences,
  type AboutBundleAdmin,
  type ExperienceAdmin,
} from "../../lib/adminContentApi";
import { useAdminSaveFeedback } from "../../context/AdminSaveFeedbackContext";
import { formatApiError } from "../../lib/adminProjectsApi";

const input =
  "w-full rounded border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30";
const label = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary mb-1";

const emptyExp: Omit<ExperienceAdmin, "id"> = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  location: "",
  summary: "",
  bullets: [],
  sortOrder: 0,
};

export function AdminAboutPage() {
  const { notify } = useAdminSaveFeedback();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState("");
  const [focusText, setFocusText] = useState("");
  const [stackJson, setStackJson] = useState("[]");
  const [contact, setContact] = useState({
    email: "",
    location: "",
    github: "",
    linkedin: "",
  });
  const [experiences, setExperiences] = useState<ExperienceAdmin[]>([]);

  const [expForm, setExpForm] = useState<(Omit<ExperienceAdmin, "id"> & { id?: number }) | null>(null);
  const [bulletsText, setBulletsText] = useState("");
  const [expSaving, setExpSaving] = useState(false);

  const applyBundle = useCallback((b: AboutBundleAdmin) => {
    setBio(b.bio);
    setFocusText(b.currentFocus.join("\n"));
    setStackJson(JSON.stringify(b.stack, null, 2));
    setContact(b.contact);
    setExperiences(b.experiences);
  }, []);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const b = await adminAbout.get();
      applyBundle(b);
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [applyBundle]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveAbout(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      let stack: AboutBundleAdmin["stack"];
      try {
        stack = JSON.parse(stackJson);
        if (!Array.isArray(stack)) throw new Error("stack must be an array");
      } catch {
        throw new Error("Invalid stack JSON — must be an array of { category, items: string[] }");
      }
      const b = await adminAbout.put({
        bio,
        currentFocus: focusText.split("\n").map((s) => s.trim()).filter(Boolean),
        stack,
        contact,
      });
      applyBundle(b);
      notify(true, "About 页面已保存。");
    } catch (e) {
      const msg = e instanceof Error ? e.message : formatApiError(e);
      setErr(msg);
      notify(false, msg);
    } finally {
      setSaving(false);
    }
  }

  function editExp(ex: ExperienceAdmin) {
    setExpForm({ ...ex });
    setBulletsText(ex.bullets.join("\n"));
  }

  function newExp() {
    setExpForm({ ...emptyExp });
    setBulletsText("");
  }

  async function saveExp(e: React.FormEvent) {
    e.preventDefault();
    if (!expForm) return;
    setExpSaving(true);
    try {
      const body = {
        ...expForm,
        bullets: bulletsText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      delete (body as { id?: number }).id;
      if (expForm.id) await adminExperiences.update(expForm.id, body);
      else await adminExperiences.create(body);
      await load();
      setExpForm(null);
      setBulletsText("");
      notify(true, expForm.id ? "经历已更新。" : "经历已创建。");
    } catch (e) {
      const msg = formatApiError(e);
      notify(false, msg);
    } finally {
      setExpSaving(false);
    }
  }

  async function delExp(id: number) {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await adminExperiences.delete(id);
      await load();
      if (expForm?.id === id) {
        setExpForm(null);
        setBulletsText("");
      }
      notify(true, "经历已删除。");
    } catch (e) {
      notify(false, formatApiError(e));
    }
  }

  if (loading) {
    return <p className="text-xs font-mono text-brand-text-secondary animate-pulse">Loading…</p>;
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-xl font-semibold text-white mb-6">About page</h1>
        {err && (
          <div className="mb-4 rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}
        <form onSubmit={saveAbout} className="max-w-2xl space-y-4">
          <div>
            <label className={label}>Bio</label>
            <textarea className={`${input} min-h-[100px]`} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div>
            <label className={label}>Current direction / focus (one per line)</label>
            <textarea className={`${input} min-h-[80px]`} value={focusText} onChange={(e) => setFocusText(e.target.value)} />
          </div>
          <div>
            <label className={label}>Technical stack (JSON array)</label>
            <textarea
              className={`${input} min-h-[140px] font-mono text-xs`}
              value={stackJson}
              onChange={(e) => setStackJson(e.target.value)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Email</label>
              <input className={input} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </div>
            <div>
              <label className={label}>Location</label>
              <input className={input} value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })} />
            </div>
            <div>
              <label className={label}>GitHub</label>
              <input className={input} value={contact.github} onChange={(e) => setContact({ ...contact, github: e.target.value })} />
            </div>
            <div>
              <label className={label}>LinkedIn</label>
              <input className={input} value={contact.linkedin} onChange={(e) => setContact({ ...contact, linkedin: e.target.value })} />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded border border-white/20 bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save about"}
          </button>
        </form>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Experience</h2>
          <button type="button" onClick={newExp} className="text-xs text-brand-text-secondary hover:text-white">
            + Add experience
          </button>
        </div>
        <ul className="border border-brand-border rounded divide-y divide-brand-border mb-6 max-w-2xl">
          {experiences.map((ex) => (
            <li key={ex.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-brand-surface/30">
              <button type="button" onClick={() => editExp(ex)} className="text-left text-sm flex-1">
                <span className="text-white">{ex.company}</span>
                <span className="text-brand-text-secondary text-xs ml-2">{ex.role}</span>
              </button>
              <button type="button" onClick={() => delExp(ex.id)} className="text-xs text-red-400">
                Delete
              </button>
            </li>
          ))}
        </ul>

        {expForm && (
          <form onSubmit={saveExp} className="max-w-2xl space-y-3 border border-brand-border rounded p-4 bg-brand-surface/20">
            <h3 className="text-sm font-mono text-brand-text-secondary uppercase tracking-widest">
              {expForm.id ? `Edit #${expForm.id}` : "New experience"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Company</label>
                <input className={input} value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} required />
              </div>
              <div>
                <label className={label}>Role</label>
                <input className={input} value={expForm.role} onChange={(e) => setExpForm({ ...expForm, role: e.target.value })} />
              </div>
              <div>
                <label className={label}>Start date</label>
                <input className={input} value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} />
              </div>
              <div>
                <label className={label}>End date (empty = Present)</label>
                <input className={input} value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Location</label>
                <input className={input} value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={label}>Summary</label>
              <textarea className={`${input} min-h-[70px]`} value={expForm.summary} onChange={(e) => setExpForm({ ...expForm, summary: e.target.value })} />
            </div>
            <div>
              <label className={label}>Bullets (one per line)</label>
              <textarea className={`${input} min-h-[80px] text-xs`} value={bulletsText} onChange={(e) => setBulletsText(e.target.value)} />
            </div>
            <div>
              <label className={label}>Sort order</label>
              <input
                type="number"
                className={input}
                value={expForm.sortOrder}
                onChange={(e) => setExpForm({ ...expForm, sortOrder: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={expSaving}
                className="rounded border border-white/20 bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {expSaving ? "Saving…" : "Save experience"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpForm(null);
                  setBulletsText("");
                }}
                className="rounded border border-brand-border px-4 py-2 text-sm text-brand-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
