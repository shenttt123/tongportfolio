import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Github, Linkedin, Twitter } from "lucide-react";
import type { AboutContent } from "../types";
import { displayUrlWithoutProtocol, githubUrlFromField, linkedinUrlFromField } from "../lib/utils";

export function Contact() {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-6">Get in Touch</h1>
            <p className="text-xl text-brand-text-secondary leading-relaxed">
              I'm always interested in hearing about new projects, 
              technical challenges, or collaboration opportunities.
            </p>
          </header>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-brand-surface border border-brand-border rounded-sm flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest mb-1">Email</p>
                <a
                  href={contact?.email ? `mailto:${contact.email}` : "#"}
                  className="text-lg font-bold hover:text-white transition-colors"
                >
                  {contact?.email ?? "…"}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-brand-surface border border-brand-border rounded-sm flex items-center justify-center">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest mb-1">GitHub</p>
                <a
                  href={gh || "https://github.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold hover:text-white transition-colors"
                >
                  {contact ? displayUrlWithoutProtocol(gh) : "…"}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-16 border-t border-brand-border">
            <h3 className="text-xs font-mono uppercase tracking-widest text-brand-text-primary mb-8">Social</h3>
            <div className="flex gap-6">
              <a
                href={li || "https://www.linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-text-secondary hover:text-white transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-brand-text-secondary hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-sm p-10">
          <form className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">Message</label>
              <textarea
                rows={6}
                className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors resize-none"
                placeholder="Tell me about your project..."
              />
            </div>
            <button className="w-full py-4 bg-white text-black font-bold rounded-sm hover:bg-opacity-90 transition-all">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
