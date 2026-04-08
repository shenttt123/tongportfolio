import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Github, ExternalLink, Calendar, Layers, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";
import { Project } from "../types";

function SectionAccordion({ index, label, content }: { index: string; label: string; content: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-brand-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-brand-text-secondary tracking-widest">{index}</span>
          <h2 className="text-base font-medium tracking-tight text-white group-hover:text-white/80 transition-colors">
            {label}
          </h2>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-brand-text-secondary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-10 pr-8 max-w-3xl">
          <div className="prose prose-invert prose-sm md:prose-base max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    fetch(`/api/projects/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Project not found");
        return res.json();
      })
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch project:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
          FETCHING_DOSSIER...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <Link to="/projects" className="text-brand-text-secondary hover:text-white underline">
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12 md:py-20"
    >
      {/* Back Navigation */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary hover:text-white mb-12 transition-colors group"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Back to Archive
      </Link>

      {/* Project Header */}
      <header className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded-sm text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">
                {project.category}
              </span>
              <span className="w-1 h-1 bg-brand-border rounded-full" />
              <span className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                ID: 0x{typeof project.id === 'number' ? project.id.toString(16).padStart(4, '0') : project.id}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-brand-text-secondary font-light leading-relaxed max-w-2xl">
              {project.summary}
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest px-3 py-1 border border-brand-border rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:col-span-5">
            <div className="glass p-8 rounded-sm space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Created
                  </p>
                  <p className="text-sm font-medium">{project.createdAt}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Status
                  </p>
                  <p className={`text-sm font-medium ${
                    project.status === "in_progress"
                      ? "text-yellow-400"
                      : project.status === "archived"
                      ? "text-brand-text-secondary"
                      : "text-green-500"
                  }`}>
                    {project.status === "in_progress"
                      ? "In Progress"
                      : project.status === "archived"
                      ? "Archived"
                      : "Production"}
                  </p>
                </div>
              </div>

              {project.relatedTo?.trim() ? (
                <div className="space-y-1 pt-4 border-t border-brand-border">
                  <p className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                    Related to
                  </p>
                  <p className="text-sm font-light text-brand-text-secondary">{project.relatedTo.trim()}</p>
                </div>
              ) : null}

              <div className="space-y-4 pt-4 border-t border-brand-border">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-4 bg-brand-bg border border-brand-border rounded-sm hover:border-white/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-widest">Source Code</span>
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-4 bg-white text-black rounded-sm hover:bg-opacity-90 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-widest font-bold">Live Demo</span>
                    </div>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <section className="mb-24">
        <div className="aspect-[21/9] bg-brand-surface border border-brand-border rounded-sm overflow-hidden">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Structured detail sections */}
      {(() => {
        const sections = [
          { key: "sectionArchitecture", label: "System Architecture",   index: "01" },
          { key: "sectionHighlights",   label: "Technical Highlights",  index: "02" },
          { key: "sectionSkills",       label: "Skills",                index: "03" },
          { key: "sectionNotes",        label: "Notes",                 index: "04" },
        ] as const;
        const visibleSections = sections.filter(
          (s) => project[s.key as keyof typeof project]?.toString().trim()
        );
        if (visibleSections.length === 0) return null;
        return (
          <div className="mb-24 space-y-0 border-t border-brand-border">
            {visibleSections.map((s) => (
              <SectionAccordion
                key={s.key}
                index={s.index}
                label={s.label}
                content={project[s.key as keyof typeof project] as string}
              />
            ))}
          </div>
        );
      })()}

      {/* Content & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          {project.content?.trim() && (
            <div className="prose prose-invert prose-sm md:prose-base max-w-none">
              <div className="markdown-body">
                <ReactMarkdown>{project.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <section className={project.content?.trim() ? "mt-24 pt-24 border-t border-brand-border" : ""}>
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary mb-12 flex items-center gap-3">
                <span className="w-4 h-px bg-brand-border" /> Visual Documentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {project.gallery.map((img, i) => (
                  <div key={i} className="aspect-[4/3] bg-brand-surface border border-brand-border rounded-sm overflow-hidden group">
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-4" />
      </div>
    </motion.div>
  );
}

