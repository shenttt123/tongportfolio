import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useHomeFullPageScroll } from "../hooks/useHomeFullPageScroll";
import { useNavItems } from "../context/NavItemsContext";
import { ProjectsSection } from "../components/sections/ProjectsSection";
import { NotesSection } from "../components/sections/NotesSection";
import { ToolsSection } from "../components/sections/ToolsSection";
import { ReadingSection } from "../components/sections/ReadingSection";
import { DemosSection } from "../components/sections/DemosSection";
import { AboutSection } from "../components/sections/AboutSection";
import { ContactSection } from "../components/sections/ContactSection";

const DEFAULT_HERO_PORTRAIT = "https://picsum.photos/seed/engineer-portrait/600/800";

const DEFAULT_HERO_TAGLINE = "Embedded Systems Engineer.";

const DEFAULT_SHORT_INTRO =
  "Specializing in the architecture of reliable, low-latency firmware " +
  "and hardware abstraction layers. My work focuses on the intersection " +
  "of real-time performance and long-term system stability.";

export function Home() {
  const { pathname } = useLocation();
  useHomeFullPageScroll(pathname === "/");
  const { isVisible } = useNavItems();

  const [heroPortraitSrc, setHeroPortraitSrc] = useState(DEFAULT_HERO_PORTRAIT);
  const [locationLabel, setLocationLabel] = useState("");
  const [heroTagline, setHeroTagline] = useState(DEFAULT_HERO_TAGLINE);
  const [shortIntroBody, setShortIntroBody] = useState(DEFAULT_SHORT_INTRO);
  const [techTags, setTechTags] = useState<string[]>([]);
  const [previewLinks, setPreviewLinks] = useState<{ label: string; url: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/site-home").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/about").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([home, about]) => {
        if (home?.portraitImagePath && String(home.portraitImagePath).trim()) {
          setHeroPortraitSrc(String(home.portraitImagePath).trim());
        }
        const ht = home?.heroText != null ? String(home.heroText).trim() : "";
        const si = home?.shortIntro != null ? String(home.shortIntro).trim() : "";
        setHeroTagline(ht || DEFAULT_HERO_TAGLINE);
        setShortIntroBody(si || DEFAULT_SHORT_INTRO);
        if (Array.isArray(home?.technicalFocusTags)) {
          setTechTags((home.technicalFocusTags as unknown[]).map(String).filter(Boolean));
        }
        if (Array.isArray(home?.contactPreviewLinks)) {
          setPreviewLinks(
            (home.contactPreviewLinks as { label: string; url: string }[]).filter(
              (l) => l && typeof l.label === "string" && typeof l.url === "string"
            )
          );
        }
        const loc = about?.contact?.location != null ? String(about.contact.location).trim() : "";
        setLocationLabel(loc);
      })
      .catch(() => {});
  }, []);

  const scrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("projects");
    if (element) {
      const offset = 56;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-6"
    >
      {/* Hero Section - Understated & Refined */}
      <section id="home" className="min-h-[100dvh] flex flex-col justify-center py-12 md:py-20 box-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                  {locationLabel
                    ? `System Status: Active / ${locationLabel}`
                    : "System Status: Active"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 leading-tight text-white">
                Tong's Personal Portfolio<br />
                <span className="text-brand-text-secondary">{heroTagline}</span>
              </h1>
              <p className="text-base md:text-lg text-brand-text-secondary max-w-xl mb-8 leading-relaxed font-light whitespace-pre-wrap">
                {shortIntroBody}
              </p>
              {/* Technical focus tags */}
              {techTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {techTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-brand-surface border border-brand-border rounded-sm text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Contact preview links */}
              {previewLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  {previewLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary hover:text-white border-b border-transparent hover:border-white/40 pb-0.5 transition-all flex items-center gap-1.5 group"
                    >
                      {link.label}
                      {!link.url.startsWith("mailto:") && (
                        <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-8">
                <a
                  href="#projects"
                  onClick={scrollToProjects}
                  className="text-xs font-mono uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-white transition-all flex items-center gap-2 group"
                >
                  Index of Works
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary hover:text-white transition-all"
                >
                  Profile
                </a>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative group w-full max-w-[min(100%,22rem)]"
            >
              <div className="aspect-square w-full bg-brand-surface border border-brand-border rounded-sm overflow-hidden relative">
                <img
                  key={heroPortraitSrc}
                  src={heroPortraitSrc}
                  alt="Tong Shen"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/40 to-transparent" />
              </div>
              {/* Technical Overlay */}
              <div className="absolute -bottom-4 -right-4 bg-brand-surface border border-brand-border p-3 rounded-sm hidden md:block max-w-[14rem]">
                <div className="flex flex-col gap-1 font-mono text-[8px] text-brand-text-secondary uppercase tracking-widest">
                  <span>UID: 0x4188_8763</span>
                  {locationLabel ? (
                    <span className="normal-case tracking-normal break-words">BASE: {locationLabel}</span>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Structured Sections — only render if visible in nav config */}
      {isVisible("projects") && <ProjectsSection />}
      {isVisible("notes")    && <NotesSection />}
      {isVisible("tools")    && <ToolsSection />}
      {isVisible("reading")  && <ReadingSection />}
      {isVisible("demos")    && <DemosSection />}
      {isVisible("about")    && <AboutSection />}
      {isVisible("contact")  && <ContactSection />}
    </motion.div>
  );
}


