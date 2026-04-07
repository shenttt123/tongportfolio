import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, Github, Linkedin, MapPin } from "lucide-react";
import { AboutContent } from "../types";
import { githubUrlFromField, linkedinUrlFromField } from "../lib/utils";

const DEFAULT_PAGE_PORTRAIT = "https://picsum.photos/seed/engineer-portrait/400/400";

export function About() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [portraitSrc, setPortraitSrc] = useState(DEFAULT_PAGE_PORTRAIT);

  useEffect(() => {
    fetch("/api/about")
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch about content:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/site-home")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.portraitImagePath && String(data.portraitImagePath).trim()) {
          setPortraitSrc(String(data.portraitImagePath).trim());
        }
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
          LOADING_PROFILE...
        </p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12 md:py-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Bio & Experience */}
        <div className="lg:col-span-8 space-y-24">
          <section>
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
              <div className="w-32 h-32 bg-brand-surface border border-brand-border rounded-sm overflow-hidden flex-shrink-0">
                <img
                  key={portraitSrc}
                  src={portraitSrc}
                  alt="Tong Shen"
                  className="w-full h-full object-cover opacity-95"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-white/20 rounded-full" />
                  <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                    Profile / Engineering Record
                  </h2>
                </div>
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
                  Tong Shen.
                </h1>
              </div>
            </div>

            <div className="space-y-8 text-brand-text-secondary leading-relaxed font-light max-w-2xl">
              <p className="text-lg text-white/90">
                {content.bio}
              </p>
              <p>
                With over a decade of experience in systems-level programming, my 
                work centers on building robust hardware abstraction layers and 
                efficient communication protocols for industrial and consumer electronics. 
                I prioritize system stability, deterministic performance, and 
                maintainable code architecture.
              </p>
              <p>
                Currently, I am exploring: {content.currentFocus.join(", ")}.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary mb-12 flex items-center gap-3">
              <span className="w-4 h-px bg-brand-border" /> 01 / Experience
            </h3>
            <div className="space-y-1">
              {content.experience.map((exp, i) => (
                <div key={i} className="group p-8 border border-brand-border rounded-sm hover:bg-brand-surface transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-white group-hover:text-white transition-colors">{exp.role}</h4>
                      <p className="text-xs font-mono text-brand-text-secondary uppercase tracking-widest mt-1">{exp.company}</p>
                    </div>
                    <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">{exp.period}</span>
                  </div>
                  <p className="text-sm text-brand-text-secondary font-light leading-relaxed max-w-xl">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Stack & Contact */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-16">
            <section className="space-y-8">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                Technical Stack
              </h3>
              <div className="space-y-8">
                {content.stack.map((group) => (
                  <div key={group.category} className="space-y-3">
                    <p className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">{group.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span key={item} className="px-2 py-1 bg-brand-surface border border-brand-border rounded-sm text-[10px] font-mono text-brand-text-secondary">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8 pt-12 border-t border-brand-border">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                Contact & Network
              </h3>
              <div className="space-y-4">
                <a href={`mailto:${content.contact.email}`} className="flex items-center gap-4 text-brand-text-secondary hover:text-white transition-colors group">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-light">{content.contact.email}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </a>
                <div className="flex items-center gap-4 text-brand-text-secondary">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-light">{content.contact.location}</span>
                </div>
                <div className="flex gap-6 pt-4">
                  <a
                    href={githubUrlFromField(content.contact.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-text-secondary hover:text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={linkedinUrlFromField(content.contact.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-text-secondary hover:text-white transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


