import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Records SPA views (path + server-derived IP) for admin visitor history.
 */
export function VisitRecorder() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      void fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        keepalive: true,
      }).catch(() => {});
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [location.pathname, location.search]);

  return null;
}
