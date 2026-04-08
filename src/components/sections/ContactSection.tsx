import { useEffect, useState } from "react";
import { Mail, Github, Linkedin, Send } from "lucide-react";
import type { AboutContent } from "../../types";
import { displayUrlWithoutProtocol, githubUrlFromField, linkedinUrlFromField } from "../../lib/utils";

export function ContactSection() {
  const [contact, setContact] = useState<AboutContent["contact"] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const [sendOk, setSendOk] = useState(false);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSendErr(null);
    setSendOk(false);
    setSending(true);
    try {
      const res = await fetch("/api/contact/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setSendErr(data?.error ?? `Request failed (${res.status})`);
        return;
      }
      setSendOk(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setSendErr("Network error — try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="min-h-[100dvh] box-border py-32 border-t border-brand-border">
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
              <div className="flex flex-col gap-2">
                <a
                  href={
                    contact?.email?.trim()
                      ? `mailto:${contact.email.trim()}`
                      : "#contact"
                  }
                  className="flex items-center gap-4 text-brand-text-secondary group hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 bg-brand-surface border border-brand-border rounded-sm flex items-center justify-center group-hover:border-white/20 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">Email</span>
                    <span className="text-sm font-light break-all">
                      {contact?.email?.trim() || "Use the form on the right →"}
                    </span>
                  </div>
                </a>

                {contact?.email?.trim() && (
                  <div className="flex gap-2 pl-14 flex-wrap">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(contact.email.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary hover:text-white border border-brand-border hover:border-white/20 px-2 py-1 rounded-sm transition-all"
                    >
                      Gmail
                    </a>
                    <a
                      href={`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(contact.email.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary hover:text-white border border-brand-border hover:border-white/20 px-2 py-1 rounded-sm transition-all"
                    >
                      Outlook
                    </a>
                  </div>
                )}
              </div>

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
              <form className="space-y-8" onSubmit={onSubmit}>
                {sendErr && (
                  <div className="rounded border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                    {sendErr}
                  </div>
                )}
                {sendOk && (
                  <div className="rounded border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
                    Message received — thank you. I will get back to you when I can.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all"
                    placeholder="Project Inquiry"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-sm font-light focus:outline-none focus:border-white/20 transition-all resize-none"
                    placeholder="Tell me about what you want to discuss."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-white text-black font-mono text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send Message"}
                  {!sending ? <Send className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> : null}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
