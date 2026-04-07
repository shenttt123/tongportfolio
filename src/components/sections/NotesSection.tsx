import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Clock, Tag, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Note } from "../../types";

export function NotesSection() {
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

  const categories = ["All", ...Array.from(new Set(notes.map(note => note.category)))];

  const filteredNotes = notes.filter(note => {
    const matchesCategory = activeCategory === "All" || note.category === activeCategory;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="notes" className="py-24 border-t border-brand-border">
      <header className="mb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 bg-white/20 rounded-full" />
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
            Technical Archive / Knowledge Base
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Notes & Articles.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          A collection of technical notes, architectural deep dives, and 
          engineering snippets. Designed as a personal knowledge base for 
          future reference.
        </p>
      </header>

      {/* Filters & Search */}
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
              placeholder="SEARCH_NOTES..." 
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
            LOADING_NOTES...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group p-8 bg-brand-surface border border-brand-border rounded-sm hover:border-white/20 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {note.date}
                  </div>
                  <span className="px-2 py-0.5 border border-brand-border rounded-sm text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                    {note.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium tracking-tight mb-4 group-hover:text-white transition-colors">
                  {note.title}
                </h3>
                
                <p className="text-sm text-brand-text-secondary leading-relaxed font-light mb-8 line-clamp-3">
                  {note.summary}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-[10px] font-mono uppercase tracking-widest text-white flex items-center gap-2 group/btn">
                    Read Note
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredNotes.length === 0 && !loading && (
        <div className="py-32 text-center border border-dashed border-brand-border rounded-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">
            No matching notes found in the knowledge base.
          </p>
        </div>
      )}
    </section>
  );
}
