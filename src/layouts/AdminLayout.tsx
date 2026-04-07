import { useEffect, useState } from "react";
import { Link, Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AdminSaveFeedbackProvider } from "../context/AdminSaveFeedbackContext";
import { AdminMobileNavPanel, AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminDashboardHome } from "../pages/admin/AdminDashboardHome";
import { AdminProjectsList } from "../pages/admin/AdminProjectsList";
import { AdminProjectNew } from "../pages/admin/AdminProjectNew";
import { AdminProjectEdit } from "../pages/admin/AdminProjectEdit";
import { AdminNotesPage } from "../pages/admin/AdminNotesPage";
import { AdminToolsPage } from "../pages/admin/AdminToolsPage";
import { AdminReadingPage } from "../pages/admin/AdminReadingPage";
import { AdminDemosPlaceholder } from "../pages/admin/AdminDemosPlaceholder";
import { AdminAboutPage } from "../pages/admin/AdminAboutPage";
import { AdminVisitorHistory } from "../pages/admin/AdminVisitorHistory";
import { AdminContactInquiries } from "../pages/admin/AdminContactInquiries";

function AdminShell() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary font-sans antialiased">
      <header className="border-b border-brand-border sticky top-0 z-30 flex h-14 items-center bg-brand-bg/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex flex-nowrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              aria-expanded={mobileNavOpen}
              aria-controls="admin-mobile-nav"
              aria-label={mobileNavOpen ? "Close CMS menu" : "Open CMS menu"}
              className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-brand-border text-white hover:bg-brand-surface transition-colors"
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </button>
            <Link
              to="/admin/home"
              className="text-xs font-mono uppercase tracking-widest text-white hover:text-brand-text-secondary transition-colors truncate"
              onClick={() => setMobileNavOpen(false)}
            >
              CMS Dashboard
            </Link>
          </div>
          <Link
            to="/"
            className="text-sm text-brand-text-secondary hover:text-white transition-colors shrink-0"
          >
            ← Public site
          </Link>
        </div>
      </header>

      {mobileNavOpen && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 top-14 z-20 bg-black/70 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            id="admin-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="CMS sections"
            className="fixed left-0 right-0 top-14 z-[25] max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-b border-brand-border bg-brand-bg/98 backdrop-blur-md shadow-xl md:hidden"
          >
            <AdminMobileNavPanel onClose={() => setMobileNavOpen(false)} />
          </div>
        </>
      )}

      <AdminSaveFeedbackProvider>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex gap-8 items-start">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </AdminSaveFeedbackProvider>
    </div>
  );
}

/** Single admin app: sidebar + in-app section routes under `/admin`. */
export function AdminLayout() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<AdminDashboardHome />} />
        <Route path="projects" element={<AdminProjectsList />} />
        <Route path="projects/new" element={<AdminProjectNew />} />
        <Route path="projects/:id/edit" element={<AdminProjectEdit />} />
        <Route path="notes" element={<AdminNotesPage />} />
        <Route path="tools" element={<AdminToolsPage />} />
        <Route path="reading" element={<AdminReadingPage />} />
        <Route path="demos" element={<AdminDemosPlaceholder />} />
        <Route path="about" element={<AdminAboutPage />} />
        <Route path="contact-inquiries" element={<AdminContactInquiries />} />
        <Route path="visitor-history" element={<AdminVisitorHistory />} />
        <Route path="*" element={<Navigate to="/admin/home" replace />} />
      </Route>
    </Routes>
  );
}
