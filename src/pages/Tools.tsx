import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Terminal, Code, Cpu, Settings, Activity, Zap } from "lucide-react";
import { Tool } from "../types";
import { fetchJsonList } from "../lib/safeFetch";

const iconMap: Record<string, any> = {
  Activity,
  Cpu,
  Code,
  Zap,
  Terminal,
  Settings
};

export function Tools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJsonList<Tool>("/api/tools")
      .then(setTools)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
          LOADING_TOOLKIT...
        </p>
      </div>
    );
  }

  // Group tools by category
  const categories = Array.from(new Set(tools.map(t => t.category)));

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
            Inventory / Technical Stack
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Tools & Setup.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          The software, hardware, and physical tools I use daily to build 
          and debug embedded systems. A curated list of reliable equipment.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => (
          <div key={category} className="p-8 bg-brand-surface border border-brand-border rounded-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand-bg border border-brand-border rounded-sm">
                <Cpu className="w-5 h-5 text-brand-text-secondary" />
              </div>
              <h2 className="text-xl font-medium text-white">{category}</h2>
            </div>
            <ul className="space-y-6">
              {tools.filter(t => t.category === category).map((tool) => {
                const Icon = iconMap[tool.icon || "Cpu"] || Cpu;
                return (
                  <li key={tool.id} className="group">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-1.5 bg-brand-bg border border-brand-border rounded-sm group-hover:border-white/20 transition-colors">
                        <Icon className="w-3 h-3 text-brand-text-secondary group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-brand-text-secondary font-light mt-1 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

