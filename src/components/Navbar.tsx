import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Home", id: "home" },
  { name: "Projects", id: "projects" },
  { name: "Notes", id: "notes" },
  { name: "Tools", id: "tools" },
  { name: "Reading", id: "reading" },
  { name: "Demos", id: "demos" },
  { name: "About", id: "about" },
  { name: "Contact", id: "contact" },
];

export function Navbar() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (location.pathname !== "/") {
      // If not on home page, let the default Link behavior take over (navigation to /#id)
      // But we want to ensure it scrolls to the right place after navigation.
      // React Router doesn't handle hash scrolling by default.
      return;
    }
    
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 56; // Navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Handle initial hash scroll if navigating from another page
    if (location.pathname === "/" && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 56;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-brand-border h-14 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        <Link 
          to="/" 
          onClick={(e) => {
            setMobileOpen(false);
            handleNavClick(e, "home");
          }}
          className="flex items-center gap-2 group min-w-0"
        >
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <span className="text-black font-mono font-bold text-[10px]">AR</span>
          </div>
          <span className="font-mono text-[11px] tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity uppercase">
            Tong_Shen.sys
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all duration-200 rounded-md relative",
                activeSection === item.id
                  ? "text-white"
                  : "text-brand-text-secondary hover:text-white hover:bg-brand-surface"
              )}
            >
              {item.name}
              {activeSection === item.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-3 right-3 h-px bg-white"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-brand-surface border border-brand-border rounded-sm">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-mono text-brand-text-secondary uppercase tracking-[0.2em]">
              Live
            </span>
          </div>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md border border-brand-border text-white hover:bg-brand-surface transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 top-14 z-40 bg-black/70 lg:hidden cursor-default"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed left-0 right-0 top-14 z-[45] max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-b border-brand-border bg-brand-bg/98 backdrop-blur-md shadow-xl lg:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/#${item.id}`}
                  onClick={(e) => {
                    setMobileOpen(false);
                    handleNavClick(e, item.id);
                  }}
                  className={cn(
                    "px-3 py-3 text-[11px] font-mono uppercase tracking-widest rounded-md transition-colors",
                    activeSection === item.id
                      ? "text-white bg-brand-surface border border-brand-border"
                      : "text-brand-text-secondary hover:text-white hover:bg-brand-surface/60 border border-transparent"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}


