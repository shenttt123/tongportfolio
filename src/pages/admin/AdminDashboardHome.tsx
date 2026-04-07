import { useCallback, useEffect, useState } from "react";
import { useAdminSaveFeedback } from "../../context/AdminSaveFeedbackContext";
import { adminSiteHome, type SiteHomeAdmin, parseListInput } from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

const input =
  "w-full rounded border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30";
const label = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary mb-2";

function linksToText(links: SiteHomeAdmin["contactPreviewLinks"]) {
  return links.map((l) => `${l.label}|${l.url}`).join("\n");
}

function textToLinks(text: string): { label: string; url: string }[] {
  return text
    .split("\n")
    .map((line) => {
      const [labelPart, ...urlParts] = line.split("|");
      const url = urlParts.join("|").trim();
      const label = (labelPart ?? "").trim();
      if (!label && !url) return null;
      return { label, url };
    })
    .filter((x): x is { label: string; url: string } => x !== null);
}

export function AdminDashboardHome() {
  const { notify } = useAdminSaveFeedback();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [portraitImagePath, setPortraitImagePath] = useState("");
  const [shortIntro, setShortIntro] = useState("");
  const [heroText, setHeroText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [linksText, setLinksText] = useState("");

  const load = useCallback(async () => {
    setErr(null);
    try {
      const h = await adminSiteHome.get();
      setPortraitImagePath(h.portraitImagePath);
      setShortIntro(h.shortIntro);
      setHeroText(h.heroText);
      setTagsText(h.technicalFocusTags.join("\n"));
      setLinksText(linksToText(h.contactPreviewLinks));
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await adminSiteHome.put({
        portraitImagePath,
        shortIntro,
        heroText,
        technicalFocusTags: parseListInput(tagsText),
        contactPreviewLinks: textToLinks(linksText),
      });
      notify(true, "Home content saved.");
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

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-2">Home content</h1>
      <p className="text-sm text-brand-text-secondary mb-8 max-w-xl">
        These fields feed the public homepage hero via{" "}
        <code className="text-xs bg-brand-surface px-1">/api/site-home</code> (portrait, hero line, intro
        paragraph, tags, preview links).
      </p>
      {err && (
        <div className="mb-6 rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}
      <form onSubmit={save} className="max-w-2xl space-y-6">
        <div>
          <label className={label}>Portrait / profile image URL</label>
          <input className={input} value={portraitImagePath} onChange={(e) => setPortraitImagePath(e.target.value)} />
        </div>
        <div>
          <label className={label}>Short intro</label>
          <textarea className={`${input} min-h-[80px]`} value={shortIntro} onChange={(e) => setShortIntro(e.target.value)} />
        </div>
        <div>
          <label className={label}>Hero text</label>
          <textarea className={`${input} min-h-[80px]`} value={heroText} onChange={(e) => setHeroText(e.target.value)} />
        </div>
        <div>
          <label className={label}>Technical focus tags (one per line)</label>
          <textarea className={`${input} min-h-[100px] font-mono text-xs`} value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
        </div>
        <div>
          <label className={label}>Contact preview links (one per line: Label|https://…)</label>
          <textarea
            className={`${input} min-h-[100px] font-mono text-xs`}
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            placeholder="Email|mailto:you@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
