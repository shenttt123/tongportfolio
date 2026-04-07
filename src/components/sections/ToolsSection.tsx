import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cpu, Globe, Zap, Database, Terminal, Clock, Tag, Code, Monitor, Settings, Layers, Shield, Activity } from "lucide-react";
import { Tool } from "../../types";
import { fetchJsonList } from "../../lib/safeFetch";

const iconMap: Record<string, any> = {
  Cpu, Globe, Zap, Database, Terminal, Clock, Tag, Code, Monitor, Settings, Layers, Shield, Activity
};

export function ToolsSection() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJsonList<Tool>("/api/tools")
      .then(setTools)
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  return (
    <section id="tools" className="py-24 border-t border-brand-border">
      <header className="mb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 bg-white/20 rounded-full" />
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
            Technical Stack / Development Environment
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Tools & Workflow.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          A curated list of development tools, software, and hardware 
          platforms used in my daily engineering workflow.
        </p>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
            LOADING_TOOLS...
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {categories.map((category, i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary mb-8 flex items-center gap-4">
                <span className="w-4 h-px bg-brand-border" /> {category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tools.filter(tool => tool.category === category).map((tool) => {
                  const Icon = iconMap[tool.icon] || Terminal;
                  return (
                    <div 
                      key={tool.id}
                      className="p-6 bg-brand-surface border border-brand-border rounded-sm hover:border-white/20 transition-all group"
                    >
                      <Icon className="w-5 h-5 text-brand-text-secondary group-hover:text-white transition-colors mb-4" />
                      <h4 className="text-sm font-medium tracking-tight group-hover:text-white transition-colors mb-1">
                        {tool.name}
                      </h4>
                      <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-widest line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
