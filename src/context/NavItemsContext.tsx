import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type NavItemConfig = {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
  visible: boolean;
};

const DEFAULT_NAV: NavItemConfig[] = [
  { id: 0, key: "home",     label: "Home",     sortOrder: 0, visible: true },
  { id: 1, key: "projects", label: "Projects", sortOrder: 1, visible: true },
  { id: 2, key: "notes",    label: "Notes",    sortOrder: 2, visible: true },
  { id: 3, key: "tools",    label: "Tools",    sortOrder: 3, visible: true },
  { id: 4, key: "reading",  label: "Reading",  sortOrder: 4, visible: true },
  { id: 5, key: "demos",    label: "Demos",    sortOrder: 5, visible: true },
  { id: 6, key: "about",    label: "About",    sortOrder: 6, visible: true },
  { id: 7, key: "contact",  label: "Contact",  sortOrder: 7, visible: true },
];

type Ctx = {
  items: NavItemConfig[];
  visibleItems: NavItemConfig[];
  isVisible: (key: string) => boolean;
  reload: () => void;
};

const NavItemsContext = createContext<Ctx>({
  items: DEFAULT_NAV,
  visibleItems: DEFAULT_NAV,
  isVisible: () => true,
  reload: () => {},
});

export function NavItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NavItemConfig[]>(DEFAULT_NAV);

  const load = useCallback(() => {
    fetch("/api/nav-items")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: NavItemConfig[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const visibleItems = useMemo(() => items.filter((i) => i.visible), [items]);
  const isVisible = useCallback((key: string) => items.some((i) => i.key === key && i.visible), [items]);

  const value = useMemo(() => ({ items, visibleItems, isVisible, reload: load }), [items, visibleItems, isVisible, load]);

  return <NavItemsContext.Provider value={value}>{children}</NavItemsContext.Provider>;
}

export function useNavItems() {
  return useContext(NavItemsContext);
}
