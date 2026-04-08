import { NavLink } from "react-router-dom";

const linkBase =
  "block rounded px-3 py-2 text-sm transition-colors border border-transparent";
const inactive = "text-brand-text-secondary hover:text-white hover:border-brand-border";
const active = "text-white bg-brand-surface border-brand-border";

export const ADMIN_NAV_ITEMS: { to: string; label: string }[] = [
  { to: "/admin/home", label: "Home" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/project-images", label: "Images" },
  { to: "/admin/nav", label: "Nav tabs" },
  { to: "/admin/notes", label: "Notes" },
  { to: "/admin/tools", label: "Tools" },
  { to: "/admin/reading", label: "Reading" },
  { to: "/admin/demos", label: "Demos" },
  { to: "/admin/about", label: "About" },
  { to: "/admin/contact-inquiries", label: "Contact" },
  { to: "/admin/visitor-history", label: "Visitors" },
];

function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/admin/home"}
          onClick={onNavigate}
          className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden md:block w-52 shrink-0 border-r border-brand-border pr-4 pb-8">
      <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary mb-4 px-3">
        CMS
      </p>
      <AdminNavLinks />
    </aside>
  );
}

export function AdminMobileNavPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-4 py-4 border-b border-brand-border bg-brand-bg">
      <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary mb-4 px-3">
        CMS
      </p>
      <AdminNavLinks onNavigate={onClose} />
    </div>
  );
}
