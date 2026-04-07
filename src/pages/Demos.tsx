import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Activity, Camera, Cpu, ExternalLink } from "lucide-react";
import { Demo } from "../types";

export function Demos() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/demos")
      .then(res => res.json())
      .then(data => {
        setDemos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch demos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
          LOADING_SIMULATIONS...
        </p>
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
      <header className="mb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 bg-white/20 rounded-full" />
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
            Sandbox / Interactive Demos
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Live Demos.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          Interactive experiments and real-time interfaces connected to 
          physical hardware and simulated environments.
        </p>
      </header>

      {demos.length === 0 ? (
        <div className="max-w-2xl rounded-sm border border-brand-border border-dashed bg-brand-surface/30 px-8 py-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary mb-3">
            Status
          </p>
          <p className="text-base text-brand-text-secondary leading-relaxed font-light">
            Under development. Interactive demos will appear here once this section is connected to the CMS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demos.map((demo) => (
            <div key={demo.id} className="group glass rounded-sm overflow-hidden flex flex-col">
              <div className="aspect-video bg-brand-surface flex items-center justify-center relative overflow-hidden">
                {demo.thumbnail ? (
                  <img
                    src={demo.thumbnail}
                    alt={demo.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Activity className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
                )}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-brand-bg border border-brand-border rounded-sm text-[10px] font-mono uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-medium mb-3 text-white group-hover:text-white transition-colors">{demo.title}</h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed mb-6 font-light">
                  {demo.description}
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {demo.tags?.map((tag) => (
                    <span key={tag} className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest px-2 py-1 border border-brand-border rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={demo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-brand-border rounded-sm text-[10px] font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  Launch Demo <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

