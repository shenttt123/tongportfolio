import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Toast = { ok: boolean; message: string };

const AdminSaveFeedbackContext = createContext<{
  notify: (ok: boolean, message?: string) => void;
} | null>(null);

const DEFAULT_OK = "保存成功。";
const DEFAULT_FAIL = "保存失败。";

export function AdminSaveFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = useCallback((ok: boolean, message?: string) => {
    setToast({
      ok,
      message: message?.trim() || (ok ? DEFAULT_OK : DEFAULT_FAIL),
    });
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <AdminSaveFeedbackContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed top-20 right-4 z-[100] max-w-md rounded border px-4 py-3 text-sm shadow-lg ${
            toast.ok
              ? "border-emerald-800/60 bg-emerald-950/90 text-emerald-100"
              : "border-red-800/60 bg-red-950/90 text-red-100"
          }`}
        >
          <p className="font-medium">{toast.ok ? "成功" : "失败"}</p>
          <p className="mt-1 text-xs opacity-90 leading-relaxed">{toast.message}</p>
        </div>
      )}
    </AdminSaveFeedbackContext.Provider>
  );
}

export function useAdminSaveFeedback() {
  const ctx = useContext(AdminSaveFeedbackContext);
  if (!ctx) {
    return {
      notify: (ok: boolean, message?: string) => {
        if (ok) console.info("[admin save]", message ?? DEFAULT_OK);
        else console.warn("[admin save]", message ?? DEFAULT_FAIL);
      },
    };
  }
  return ctx;
}
