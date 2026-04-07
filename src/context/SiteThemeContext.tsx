import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SiteThemeMode = "dark" | "light";

const STORAGE_KEY = "site-theme";

type Ctx = {
  mode: SiteThemeMode;
  isLight: boolean;
  setMode: (m: SiteThemeMode) => void;
  toggle: () => void;
};

const SiteThemeContext = createContext<Ctx | null>(null);

function readStored(): SiteThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SiteThemeMode>(() =>
    typeof document !== "undefined" ? readStored() : "dark"
  );

  useEffect(() => {
    setModeState(readStored());
  }, []);

  const setMode = useCallback((m: SiteThemeMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next: SiteThemeMode = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isLight: mode === "light",
      setMode,
      toggle,
    }),
    [mode, setMode, toggle]
  );

  return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>;
}

export function useSiteTheme(): Ctx {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error("useSiteTheme must be used within SiteThemeProvider");
  }
  return ctx;
}
