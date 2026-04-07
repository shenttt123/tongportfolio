import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Book, Clock, Tag, ArrowRight, Hash } from "lucide-react";
import { cn } from "../lib/utils";
import { Note } from "../types";

const categories = ["All", "ESP32", "FreeRTOS", "Networking", "Databases", "Algorithms"];

export function Notes() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes")
      .then(res => res.json())
      .then(data => {
        setNotes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch notes:", err);
        setLoading(false);
      });
  }, []);

  const filteredNotes = notes.filter(note => {
    const matchesCategory = activeCategory === "All" || note.category === activeCategory;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
          LOADING_NOTEBOOK...
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
            Archive / Technical Notebook
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Knowledge Base.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          A curated collection of technical notes, architectural deep dives, 
          and engineering snippets. Designed for clarity and long-term reference.
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-12">
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
              Search
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
              <input
                type="text"
                placeholder="SEARCH_NOTES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-sm pl-10 pr-4 py-2.5 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
              Categories
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "text-left px-3 py-2 text-[10px] font-mono uppercase tracking-widest rounded-sm transition-all",
                    activeCategory === cat
                      ? "bg-white text-black"
                      : "text-brand-text-secondary hover:text-white hover:bg-brand-surface"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Notes List */}
        <div className="lg:col-span-9 space-y-12">
          <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-brand-text-secondary flex items-center gap-3">
            <span className="w-4 h-px bg-brand-border" /> 02 / Archive
          </h3>
          
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.article
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="group p-8 border-b border-brand-border/50 last:border-0 hover:bg-brand-surface/30 transition-colors rounded-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {note.date}
                      </div>
                      <span className="w-1 h-1 bg-brand-border rounded-full" />
                      <div className="flex items-center gap-2 text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">
                        <Tag className="w-3 h-3" />
                        {note.category}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-brand-text-secondary opacity-40">
                      {note.readTime} READ
                    </span>
                  </div>
                  
                  <h4 className="text-2xl font-medium mb-4 group-hover:text-white transition-colors leading-snug">
                    {note.title}
                  </h4>
                  
                  <p className="text-sm text-brand-text-secondary leading-relaxed font-light mb-6 max-w-3xl">
                    {note.summary}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex gap-3">
                      {note.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                          <Hash className="w-2 h-2" /> {tag}
                        </span>
                      ))}
                    </div>
                    <button className="ml-auto text-[10px] font-mono uppercase tracking-widest border-b border-white/20 pb-1 hover:border-white transition-all">
                      Open Note
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
            
            {filteredNotes.length === 0 && (
              <div className="py-20 text-center border border-dashed border-brand-border rounded-sm">
                <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary">
                  No matches found in the notebook.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


