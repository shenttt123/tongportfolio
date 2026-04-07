import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Mail, Github, Linkedin, MapPin, Calendar, Briefcase, Code, Terminal } from "lucide-react";
import { AboutContent } from "../../types";
import { displayUrlWithoutProtocol, githubUrlFromField, linkedinUrlFromField } from "../../lib/utils";

const DEFAULT_ABOUT_PORTRAIT = "https://picsum.photos/seed/engineer-about/800/800";

export function AboutSection() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [portraitSrc, setPortraitSrc] = useState(DEFAULT_ABOUT_PORTRAIT);

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

  if (loading || !content) {
    return (
      <section id="about" className="min-h-[100dvh] box-border py-24 border-t border-brand-border text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
          LOADING_PROFILE...
        </p>
      </section>
    );
  }

  return (
    <section id="about" className="min-h-[100dvh] box-border py-24 border-t border-brand-border">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Bio & Focus */}
        <div className="lg:col-span-7 space-y-16">
          <header>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-white/20 rounded-full" />
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                Profile / Professional Background
              </h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8 text-white">
              Tong Shen
            </h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-brand-text-secondary leading-relaxed font-light mb-8">
                {content.bio}
              </p>
            </div>
          </header>

          <div className="space-y-8">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary flex items-center gap-4">
              <span className="w-4 h-px bg-brand-border" /> Current Focus
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.currentFocus.map((focus, i) => (
                <div key={i} className="p-6 bg-brand-surface border border-brand-border rounded-sm">
                  <p className="text-sm text-brand-text-secondary font-light leading-relaxed">
                    {focus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary flex items-center gap-4">
              <span className="w-4 h-px bg-brand-border" /> Experience
            </h3>
            <div className="space-y-6">
              {content.experience.map((exp, i) => (
                <div key={i} className="group relative pl-8 pb-8 border-l border-brand-border last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-brand-bg border border-brand-border rounded-full group-hover:border-white transition-colors" />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h4 className="text-lg font-medium tracking-tight text-white">
                      {exp.role}
                    </h4>
                    <span className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest bg-brand-surface px-2 py-1 rounded-sm border border-brand-border">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-brand-text-secondary uppercase tracking-widest mb-4">
                    {exp.company}
                  </p>
                  <p className="text-sm text-brand-text-secondary font-light leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Meta & Stack */}
        <div className="lg:col-span-5 space-y-16">
          <div className="p-8 bg-brand-surface border border-brand-border rounded-sm space-y-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                Technical Stack
              </h3>
              <div className="space-y-4">
                {content.stack.map((group, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest opacity-50">{group.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((tech, j) => (
                        <span key={j} className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-sm text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-brand-border">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                Contact & Meta
              </h3>
              <div className="flex items-start gap-6">
                {/* Contact links */}
                <div className="space-y-4 flex-1 min-w-0">
                  {content.contact.location?.trim() ? (
                    <div className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-light">{content.contact.location.trim()}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-light break-all">{content.contact.email}</span>
                  </div>
                  <a
                    href={githubUrlFromField(content.contact.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-light">
                      {displayUrlWithoutProtocol(githubUrlFromField(content.contact.github))}
                    </span>
                  </a>
                  <a
                    href={linkedinUrlFromField(content.contact.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-light">
                      {displayUrlWithoutProtocol(linkedinUrlFromField(content.contact.linkedin))}
                    </span>
                  </a>
                </div>

                {/* Portrait — right of Contact & Meta */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-brand-surface border border-brand-border rounded-sm overflow-hidden relative group">
                  <img
                    key={portraitSrc}
                    src={portraitSrc}
                    alt="Tong Shen"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/60 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
