import { Outlet } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white selection:bg-white selection:text-black">
      <Navbar />
      <main className="flex-grow pt-14">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
