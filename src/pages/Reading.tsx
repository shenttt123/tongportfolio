import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, Link as LinkIcon, Star, CheckCircle2, Clock } from "lucide-react";
import { ReadingItem } from "../types";
import { cn } from "../lib/utils";
import { fetchJsonList } from "../lib/safeFetch";

export function Reading() {
  const [readingList, setReadingList] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJsonList<ReadingItem>("/api/reading")
      .then(setReadingList)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary animate-pulse">
          LOADING_LIBRARY...
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
            Library / Knowledge Archive
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
          Reading List.
        </h1>
        <p className="text-base md:text-lg text-brand-text-secondary leading-relaxed font-light">
          A curated selection of books, papers, and courses that have 
          shaped my understanding of engineering and technology.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {readingList.map((item) => (
          <div key={item.id} className="p-8 bg-brand-surface border border-brand-border rounded-sm group hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-brand-bg border border-brand-border rounded-sm">
                <BookOpen className="w-5 h-5 text-brand-text-secondary group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                {item.status === "completed" ? (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-mono uppercase tracking-widest rounded-sm">
                    <CheckCircle2 className="w-2 h-2" /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-500 text-[8px] font-mono uppercase tracking-widest rounded-sm">
                    <Clock className="w-2 h-2" /> Reading
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-mono text-brand-text-secondary uppercase tracking-widest mb-1">
                  {item.category}
                </p>
                <h3 className="text-lg font-medium text-white group-hover:text-white transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-brand-text-secondary font-light mt-2">
                  by {item.author}
                </p>
              </div>
              
              {item.rating && (
                <div className="flex gap-1 pt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3 h-3",
                        i < item.rating! ? "text-yellow-500 fill-yellow-500" : "text-brand-border"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

