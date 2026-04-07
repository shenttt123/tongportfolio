import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ExternalLink, Play, Monitor } from "lucide-react";
import { Demo } from "../../types";
import { fetchJsonList } from "../../lib/safeFetch";

export function DemosSection() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJsonList<Demo>("/api/demos")
      .then(setDemos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="demos" className="py-24 border-t border-brand-border">
      <header className="mb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 bg-white/20 rounded-full" />
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
            Interactive Archive / Live Prototypes
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Interactive Demos.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          A collection of live demos, real-time simulations, and 
          interactive prototypes showcasing specific technical concepts.
        </p>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
            LOADING_DEMOS...
          </p>
        </div>
      ) : demos.length === 0 ? (
        <div className="max-w-2xl rounded-sm border border-brand-border border-dashed bg-brand-surface/30 px-8 py-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary mb-3">
            Status
          </p>
          <p className="text-base text-brand-text-secondary leading-relaxed font-light">
            Under development. Interactive demos will be listed here once this section is wired to the CMS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demos.map((demo, i) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-brand-surface border border-brand-border rounded-sm overflow-hidden hover:border-white/20 transition-all"
            >
              <div className="aspect-video bg-brand-bg relative overflow-hidden">
                {demo.thumbnail ? (
                  <img 
                    src={demo.thumbnail} 
                    alt={demo.title} 
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-70 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Monitor className="w-12 h-12 text-brand-border group-hover:text-white/20 transition-colors" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-4">
                <h3 className="text-xl font-medium tracking-tight group-hover:text-white transition-colors">
                  {demo.title}
                </h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed font-light line-clamp-2">
                  {demo.description}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {demo.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="pt-4">
                  <a 
                    href={demo.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono uppercase tracking-widest text-white flex items-center gap-2 group/link"
                  >
                    Launch Demo
                    <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
