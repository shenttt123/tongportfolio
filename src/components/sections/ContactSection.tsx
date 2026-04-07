import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Github, Linkedin, ArrowRight, Send } from "lucide-react";
import type { AboutContent } from "../../types";
import { displayUrlWithoutProtocol, githubUrlFromField, linkedinUrlFromField } from "../../lib/utils";

export function ContactSection() {
  const [contact, setContact] = useState<AboutContent["contact"] | null>(null);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AboutContent | null) => {
        if (data?.contact) setContact(data.contact);
      })
      .catch(() => {});
  }, []);

  const gh = contact ? githubUrlFromField(contact.github) : "";
  const li = contact ? linkedinUrlFromField(contact.linkedin) : "";

  return (
    <section id="contact" className="py-32 border-t border-brand-border">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-white/20 rounded-full" />
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
                Communication / Contact Channel
              </h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8 text-white">
              Get in Touch.
            </h1>
            <p className="text-base text-brand-text-secondary leading-relaxed font-light">
              Available for technical consultation, engineering roles, and 
              collaborations. If you have a project that requires a deep 
              understanding of hardware-software integration, I would be 
              interested in discussing it.
            </p>
            
            <div className="space-y-6 pt-8">
              <a
                href={contact?.email ? `mailto:${contact.email}` : "#contact"}
                className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-brand-surface border border-brand-border rounded-sm flex items-center justify-center group-hover:border-white/20 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">Email</span>
                  <span className="text-sm font-light truncate">
                    {contact?.email ?? "…"}
                  </span>
                </div>
              </a>

              <a
                href={gh || "https://github.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-brand-surface border border-brand-border rounded-sm flex items-center justify-center group-hover:border-white/20 transition-all">
                  <Github className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">GitHub</span>
                  <span className="text-sm font-light truncate">
                    {contact ? displayUrlWithoutProtocol(gh) : "…"}
                  </span>
                </div>
              </a>

              <a
                href={li || "https://www.linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-brand-surface border border-brand-border rounded-sm flex items-center justify-center group-hover:border-white/20 transition-all">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">LinkedIn</span>
                  <span className="text-sm font-light truncate">
                    {contact ? displayUrlWithoutProtocol(li) : "…"}
                  </span>
                </div>
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-7">
            <div className="p-8 md:p-12 bg-brand-surface border border-brand-border rounded-sm">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Subject</label>
                  <input 
                    type="text" 
                    className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all"
                    placeholder="Project Inquiry"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Message</label>
                  <textarea 
                    rows={6}
                    className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full py-4 bg-white text-black font-mono text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 group"
                >
                  Send Message
                  <Send className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
