import { useRef, useEffect } from 'react';
import type { AnalysisCategory } from '../types';

interface CategoryTabsProps {
  categories: AnalysisCategory[];
  activeId: string;
  onChange: (id: string) => void;
}

export const CategoryTabs = ({ categories, activeId, onChange }: CategoryTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const btn = activeRef.current;
      const left = btn.offsetLeft - container.offsetLeft - 16;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onChange(cat.id)}
            className={`whitespace-nowrap px-3 py-2 font-mono text-[11px] tracking-wide border transition-colors shrink-0 ${
              isActive
                ? 'bg-ink text-white border-ink'
                : 'bg-transparent text-ink/50 border-ink/10 hover:text-ink hover:border-ink/30'
            }`}
          >
            {cat.shortLabel}
          </button>
        );
      })}
    </div>
  );
};
