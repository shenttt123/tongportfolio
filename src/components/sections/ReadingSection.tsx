import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, BookOpen, FileText, GraduationCap } from "lucide-react";
import { ReadingItem } from "../../types";

export function ReadingSection() {
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reading")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch reading list:", err);
        setLoading(false);
      });
  }, []);

  const categories = ["Book", "Paper", "Course"];

  return (
    <section id="reading" className="py-24 border-t border-brand-border">
      <header className="mb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 bg-white/20 rounded-full" />
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-text-secondary">
            Technical Archive / Learning Path
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Reading & Learning.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          A collection of books, research papers, and courses that have 
          significantly influenced my engineering perspective.
        </p>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
            LOADING_READING_LIST...
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
                <span className="w-4 h-px bg-brand-border" /> {category}s
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.filter(item => item.category === category).map((item) => (
                  <div 
                    key={item.id}
                    className="p-8 bg-brand-surface border border-brand-border rounded-sm hover:border-white/20 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest">
                        {item.category === "Book" && <BookOpen className="w-3 h-3" />}
                        {item.category === "Paper" && <FileText className="w-3 h-3" />}
                        {item.category === "Course" && <GraduationCap className="w-3 h-3" />}
                        {item.status}
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-2.5 h-2.5 ${i < item.rating ? 'text-white fill-white' : 'text-brand-text-secondary opacity-30'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-medium tracking-tight group-hover:text-white transition-colors mb-2">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-widest">
                      {item.author}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
