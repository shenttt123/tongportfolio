import { Outlet } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SiteThemeProvider, useSiteTheme } from "../context/SiteThemeContext";
import { ThemeLightSwitch } from "../components/ThemeLightSwitch";
import { NavItemsProvider } from "../context/NavItemsContext";

function PublicLayoutInner() {
  const { mode } = useSiteTheme();

  return (
    <div
      data-theme={mode}
      className="min-h-screen flex flex-col bg-brand-bg text-brand-text-primary"
    >
      <Navbar />
      <main className="flex-grow pt-14">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
      <Footer />
      <ThemeLightSwitch />
    </div>
  );
}

export function PublicLayout() {
  return (
    <SiteThemeProvider>
      <NavItemsProvider>
        <PublicLayoutInner />
      </NavItemsProvider>
    </SiteThemeProvider>
  );
}
