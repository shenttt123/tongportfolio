import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { fetchJsonList } from "../../lib/safeFetch";
import { Project } from "../../types";

/** Split a raw category string into trimmed, non-empty tokens. */
function parseCategories(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJsonList<Project>("/api/projects")
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  /** Sorted unique categories derived from all project.category values. */
  const categories = useMemo(() => {
    const all = new Set<string>();
    projects.forEach((p) => parseCategories(p.category).forEach((c) => all.add(c)));
    return ["All", ...Array.from(all).sort()];
  }, [projects]);

  const filteredProjects = projects.filter((project) => {
    const cats = parseCategories(project.category);
    const matchesCategory = activeCategory === "All" || cats.includes(activeCategory);
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="projects" className="min-h-[100dvh] box-border py-24 border-t border-brand-border">
      <header className="mb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 bg-white/20 rounded-full" />
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
            Archive / Index of Engineering Projects
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Technical Works
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          A structured index of systems engineering projects. Each entry represents a specific technical challenge.
        </p>
      </header>

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-brand-border pb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all duration-200 rounded-sm",
                activeCategory === cat
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-brand-text-secondary border-brand-border hover:border-white/40 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-brand-text-secondary">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-brand-border rounded-sm bg-brand-surface/30">
            <Search className="w-3 h-3" />
            <input 
              type="text" 
              placeholder="SEARCH_INDEX..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[10px] font-mono uppercase tracking-widest focus:outline-none w-32"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
            LOADING_ARCHIVE...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group"
              >
                <Link to={`/projects/${project.slug}`} className="block space-y-6">
                  <div className="aspect-[4/3] bg-brand-surface border border-brand-border rounded-sm overflow-hidden relative">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-70 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                        {project.createdAt.split('-')[0]}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                      {parseCategories(project.category).map((cat) => (
                        <span key={cat} className="px-2 py-1 bg-brand-bg/80 backdrop-blur-sm border border-brand-border rounded-sm text-[9px] font-mono uppercase tracking-widest text-white">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium tracking-tight group-hover:text-white transition-colors">
                        {project.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                    <p className="text-sm text-brand-text-secondary leading-relaxed font-light line-clamp-2">
                      {project.summary}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredProjects.length === 0 && !loading && (
        <div className="py-32 text-center border border-dashed border-brand-border rounded-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">
            No matching entries found in the archive.
          </p>
        </div>
      )}
    </section>
  );
}
