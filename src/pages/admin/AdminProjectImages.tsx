import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import {
  adminListProjectImages,
  adminUploadProjectImages,
  adminDeleteProjectImages,
  adminUpdateProjectImageLabel,
  type ProjectImageRow,
  type DeleteProjectImagesResult,
} from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

export function AdminProjectImages() {
  const [images, setImages] = useState<ProjectImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editLabelId, setEditLabelId] = useState<number | null>(null);
  const [labelDraft, setLabelDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const data = await adminListProjectImages(null);
      setImages(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const allSelected = images.length > 0 && images.every((img) => selected.has(img.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(images.map((img) => img.id)));
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setErr(null);
    try {
      const created = await adminUploadProjectImages(files, null);
      setImages((prev) => [...created, ...prev]);
    } catch (ex) {
      setErr(formatApiError(ex));
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteSelected() {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`Permanently delete ${ids.length} image(s)?`)) return;
    setDeleting(true);
    setErr(null);
    try {
      const result: DeleteProjectImagesResult = await adminDeleteProjectImages(ids);
      // Remove successfully deleted images from the list
      const deletedIds = new Set(ids.filter((id) => !result.blocked.some((b) => b.imageId === id)));
      setImages((prev) => prev.filter((img) => !deletedIds.has(img.id)));
      setSelected(new Set(
        [...selected].filter((id) => !deletedIds.has(id))
      ));
      // Show alert for blocked images
      if (result.blocked.length > 0) {
        const lines = result.blocked.map((b) => {
          const refs = b.usedIn
            .map((u) => `"${u.projectTitle}" (${u.field === "coverImage" ? "cover" : "gallery"})`)
            .join(", ");
          return `• ${b.url.split("/").pop()} — used in ${refs}`;
        });
        setErr(
          `${result.blocked.length} image(s) could not be deleted because they are used in projects:\n${lines.join("\n")}`
        );
      }
    } catch (ex) {
      setErr(formatApiError(ex));
    } finally {
      setDeleting(false);
    }
  }

  async function saveLabel(id: number) {
    try {
      const updated = await adminUpdateProjectImageLabel(id, labelDraft);
      setImages((prev) => prev.map((img) => (img.id === id ? updated : img)));
    } catch (ex) {
      setErr(formatApiError(ex));
    } finally {
      setEditLabelId(null);
    }
  }

  const labelCls = "block text-xs font-mono uppercase tracking-widest text-brand-text-secondary";

  if (loading) {
    return <p className="text-xs font-mono text-brand-text-secondary animate-pulse">Loading…</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Project image library</h1>
          <p className="text-sm text-brand-text-secondary max-w-xl">
            Upload and manage images for projects. Images are stored under{" "}
            <code className="text-xs bg-brand-surface px-1">data/uploads/projects/</code> and served at{" "}
            <code className="text-xs bg-brand-surface px-1">/uploads/projects/…</code>. Use the{" "}
            <strong className="text-white font-medium">Library</strong> button in the project form to pick from here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {selected.size > 0 && (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 rounded border border-red-800/60 bg-red-950/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-950/70 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete {selected.size}
            </button>
          )}
          <label className="flex cursor-pointer items-center gap-1.5 rounded border border-brand-border px-3 py-1.5 text-xs text-white hover:bg-brand-surface transition-colors">
            <Upload className="w-3 h-3" />
            {uploading ? "Uploading…" : "Upload images"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
          <button
            type="button"
            onClick={() => { setLoading(true); load(); }}
            className="rounded border border-brand-border px-3 py-1.5 text-xs text-white hover:bg-brand-surface transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200 whitespace-pre-line">
          {err}
        </div>
      )}

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-brand-border rounded text-brand-text-secondary gap-4">
          <p className="text-sm">No images uploaded yet.</p>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-brand-border px-4 py-2 text-sm text-white hover:bg-brand-surface transition-colors">
            <Upload className="w-4 h-4" />
            Upload first image
            <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={handleUpload} />
          </label>
        </div>
      ) : (
        <>
          {/* Select-all row */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="accent-white cursor-pointer"
              aria-label="Select all"
            />
            <span className={`${labelCls} cursor-pointer`} onClick={toggleAll}>
              {allSelected ? "Deselect all" : "Select all"} ({images.length})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {images.map((img) => {
              const isSelected = selected.has(img.id);
              return (
                <div
                  key={img.id}
                  className={`relative group rounded border overflow-hidden transition-all ${
                    isSelected ? "border-white ring-2 ring-white/60" : "border-brand-border hover:border-white/30"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className="aspect-square cursor-pointer"
                    onClick={() => toggleOne(img.id)}
                  >
                    <img
                      src={img.url}
                      alt={img.label || img.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Checkbox */}
                  <div
                    className="absolute top-1.5 left-1.5 cursor-pointer"
                    onClick={() => toggleOne(img.id)}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-white border-white" : "bg-black/40 border-white/50 group-hover:border-white"}`}>
                      {isSelected && <span className="text-black text-[10px] font-bold leading-none">✓</span>}
                    </div>
                  </div>

                  {/* URL copy / info */}
                  <div className="px-2 py-1.5 bg-brand-surface border-t border-brand-border">
                    {/* Label editable */}
                    {editLabelId === img.id ? (
                      <input
                        autoFocus
                        className="w-full bg-transparent border-b border-white/30 text-[10px] text-white outline-none mb-1"
                        value={labelDraft}
                        onChange={(e) => setLabelDraft(e.target.value)}
                        onBlur={() => saveLabel(img.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveLabel(img.id);
                          if (e.key === "Escape") setEditLabelId(null);
                        }}
                      />
                    ) : (
                      <p
                        className="text-[10px] text-white/60 truncate cursor-text mb-0.5"
                        onClick={() => { setEditLabelId(img.id); setLabelDraft(img.label); }}
                        title={img.label || "Click to add label"}
                      >
                        {img.label || <span className="opacity-40 italic">add label…</span>}
                      </p>
                    )}
                    <p className="text-[9px] font-mono text-brand-text-secondary truncate" title={img.url}>
                      {img.url}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(img.url)}
                      className="mt-1 text-[9px] font-mono text-brand-text-secondary hover:text-white transition-colors"
                    >
                      copy url
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
