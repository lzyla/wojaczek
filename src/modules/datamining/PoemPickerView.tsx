import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search } from 'lucide-react';

interface PoemPickerViewProps {
  poems: { id: string; title: string }[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

/** Clean poem title: remove leading asterisks and parentheses */
function cleanTitle(title: string): string {
  let t = title.trim();
  // Remove leading "* * *" or "***" patterns
  t = t.replace(/^\*\s*\*\s*\*\s*/, '').trim();
  // Remove wrapping parentheses: "* * * (Tekst)" -> "Tekst"
  t = t.replace(/^\((.+)\)\s*$/, '$1');
  // If title is empty after cleanup, use "Bez tytulu"
  return t || 'Bez tytulu';
}

export const PoemPickerView = ({ poems, onSelect, onBack }: PoemPickerViewProps) => {
  const [query, setQuery] = useState('');

  const cleaned = poems.map(p => ({ ...p, displayTitle: cleanTitle(p.title) }));
  const filtered = cleaned.filter((p) =>
    p.displayTitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      key="poem-picker"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-ink/50 hover:text-ink transition-colors mb-6 mt-4 py-2"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span className="text-sm">Wroc do listy analiz</span>
      </button>

      <h2 className="text-3xl font-cormorant font-bold tracking-tight leading-none mb-6">
        Wybierz wiersz
      </h2>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj..."
          className="w-full border border-ink/10 bg-transparent py-2.5 pl-9 pr-3 font-mono text-xs placeholder:text-ink/30 focus:outline-none focus:border-ink/30"
        />
      </div>

      <p className="text-[11px] opacity-30 mb-4">{filtered.length} wierszy</p>

      {/* Poem list */}
      <div className="space-y-0">
        {filtered.map((poem) => (
          <button
            key={poem.id}
            onClick={() => onSelect(poem.id)}
            className="w-full text-left py-3 border-b border-ink/10 hover:bg-ink/[0.03] transition-colors px-1"
          >
            <span className="text-sm">{poem.displayTitle}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-ink/40 font-mono py-4 text-center">
            Brak wynikow
          </p>
        )}
      </div>
    </motion.div>
  );
};
