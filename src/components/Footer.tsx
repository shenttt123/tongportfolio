import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AboutContent } from "../types";
import { githubUrlFromField, linkedinUrlFromField } from "../lib/utils";

export function Footer() {
  const [contact, setContact] = useState<AboutContent["contact"] | null>(null);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AboutContent | null) => {
        if (data?.contact) setContact(data.contact);
      })
      .catch(() => {});
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
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
    <footer className="border-t border-brand-border py-12 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-mono font-bold text-[10px]">TS</span>
              </div>
              <span className="font-mono text-xs tracking-tighter opacity-60 uppercase">
                Tong_Shen.sys
              </span>
            </div>
            <p className="text-brand-text-secondary text-sm max-w-sm leading-relaxed font-light">
              Embedded systems engineer specializing in real-time kernels, 
              industrial IoT, and high-performance hardware abstraction layers.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-brand-text-primary mb-6">
              Connect
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={contact ? githubUrlFromField(contact.github) : "https://github.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-text-secondary hover:text-white transition-colors font-light"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={contact ? linkedinUrlFromField(contact.linkedin) : "https://www.linkedin.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-text-secondary hover:text-white transition-colors font-light"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={
                    contact?.email?.trim()
                      ? `mailto:${contact.email.trim()}`
                      : "/#contact"
                  }
                  className="text-sm text-brand-text-secondary hover:text-white transition-colors font-light break-all"
                >
                  {contact?.email?.trim() ? contact.email.trim() : "Contact form →"}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-brand-text-primary mb-6">
              Archive
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/#projects" onClick={() => scrollToSection("projects")} className="text-sm text-brand-text-secondary hover:text-white transition-colors font-light">Projects</Link>
              </li>
              <li>
                <Link to="/#notes" onClick={() => scrollToSection("notes")} className="text-sm text-brand-text-secondary hover:text-white transition-colors font-light">Notes</Link>
              </li>
              <li>
                <Link to="/#tools" onClick={() => scrollToSection("tools")} className="text-sm text-brand-text-secondary hover:text-white transition-colors font-light">Tools</Link>
              </li>
              <li>
                <Link to="/#reading" onClick={() => scrollToSection("reading")} className="text-sm text-brand-text-secondary hover:text-white transition-colors font-light">Reading List</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">
            © 2026 Tong Shen. All rights reserved.
          </p>
          <p className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">
            Built with React & Express
          </p>
        </div>
      </div>
    </footer>
  );
}

