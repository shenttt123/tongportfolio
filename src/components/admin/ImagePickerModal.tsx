import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2, Upload, X, Check } from "lucide-react";
import {
  adminListProjectImages,
  adminUploadProjectImages,
  adminDeleteProjectImages,
  type ProjectImageRow,
  type DeleteProjectImagesResult,
} from "../../lib/adminContentApi";
import { formatApiError } from "../../lib/adminProjectsApi";

type Mode = "single" | "multi";

type Props = {
  mode: Mode;
  currentUrls: string[];
  projectId?: number | null;
  onConfirm: (urls: string[]) => void;
  onClose: () => void;
};

export function ImagePickerModal({ mode, currentUrls, projectId, onConfirm, onClose }: Props) {
  const [images, setImages] = useState<ProjectImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(currentUrls));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const data = await adminListProjectImages(null);
      setImages(data);
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (mode === "single") {
        next.clear();
        if (!prev.has(url)) next.add(url);
      } else {
        next.has(url) ? next.delete(url) : next.add(url);
      }
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
      const created = await adminUploadProjectImages(files, projectId);
      setImages((prev) => [...created, ...prev]);
    } catch (ex) {
      setErr(formatApiError(ex));
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteSelected() {
    const selectedIds = selectedUploadedIds;
    if (!selectedIds.length) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected image(s)?`)) return;
    setDeleting(true);
    setErr(null);
    try {
      const result: DeleteProjectImagesResult = await adminDeleteProjectImages(selectedIds);
      const actuallyDeletedIds = new Set(
        selectedIds.filter((id) => !result.blocked.some((b) => b.imageId === id))
      );
      const deletedUrls = new Set(
        images.filter((img) => actuallyDeletedIds.has(img.id)).map((img) => img.url)
      );
      setImages((prev) => prev.filter((img) => !actuallyDeletedIds.has(img.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        deletedUrls.forEach((url) => next.delete(url));
        onConfirm([...next]);
        return next;
      });
      if (result.blocked.length > 0) {
        const names = result.blocked
          .map((b) => {
            const projs = b.usedIn.map((u) => u.projectTitle).join(", ");
            return `${b.url.split("/").pop()} (used in: ${projs})`;
          })
          .join("\n");
        setErr(`${result.blocked.length} image(s) could not be deleted — still used in projects:\n${names}`);
      }
    } catch (ex) {
      setErr(formatApiError(ex));
    } finally {
      setDeleting(false);
    }
  }

  function confirm() {
    onConfirm([...selected]);
    onClose();
  }

  const selectedCount = selected.size;
  /** Only uploaded images that are currently selected (excludes plain external URLs). */
  const selectedUploadedIds = images
    .filter((img) => selected.has(img.url))
    .map((img) => img.id);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl max-h-[90dvh] flex flex-col rounded border border-brand-border bg-brand-bg shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border shrink-0">
          <h2 className="text-sm font-semibold text-white">
            {mode === "single" ? "Pick cover image" : "Pick gallery images"}
          </h2>
          <div className="flex items-center gap-2">
            {selectedUploadedIds.length > 0 && (
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 rounded border border-red-800/60 bg-red-950/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/60 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete {selectedUploadedIds.length}
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
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded border border-brand-border text-brand-text-secondary hover:text-white hover:bg-brand-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mx-5 mt-3 rounded border border-red-900/50 bg-red-950/40 px-4 py-2 text-xs text-red-200 shrink-0 whitespace-pre-line">
            {err}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-xs font-mono text-brand-text-secondary animate-pulse py-10 text-center">Loading…</p>
          ) : images.length === 0 ? (
            <p className="py-16 text-center text-sm text-brand-text-secondary">
              No images yet. Upload some above.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img) => {
                const isSelected = selected.has(img.url);
                return (
                  <div
                    key={img.id}
                    onClick={() => toggleSelect(img.url)}
                    className={`relative rounded border cursor-pointer transition-all select-none overflow-hidden aspect-square ${
                      isSelected
                        ? "border-white ring-2 ring-white/60"
                        : "border-brand-border hover:border-white/30"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label || img.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-brand-border shrink-0 gap-4">
          <p className="text-xs text-brand-text-secondary">
            {selectedCount === 0
              ? "No image selected"
              : mode === "single"
              ? "1 image selected"
              : `${selectedCount} image${selectedCount > 1 ? "s" : ""} selected`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-brand-border px-4 py-1.5 text-sm text-brand-text-secondary hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={selectedCount === 0}
              className="rounded border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-40 transition-colors"
            >
              Use selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
