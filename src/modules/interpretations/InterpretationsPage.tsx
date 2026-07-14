import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { INTERPRETATION_POEMS } from '../../lib/interpretationService';
import { InterpretPoemView } from './InterpretPoemView';
import { InterpretDetailView } from './InterpretDetailView';
import type { InterpretationPoem } from '../../types';

export const InterpretationsPage = () => {
  const [selectedPoem, setSelectedPoem] = useState<InterpretationPoem | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);

  if (detailNodeId && selectedPoem) {
    return (
      <InterpretDetailView
        poem={selectedPoem}
        nodeId={detailNodeId}
        onBack={() => setDetailNodeId(null)}
        onNavigateNode={(nodeId) => setDetailNodeId(nodeId)}
      />
    );
  }

  if (selectedPoem) {
    return (
      <InterpretPoemView
        poem={selectedPoem}
        onBack={() => setSelectedPoem(null)}
        onNodeClick={(nodeId) => setDetailNodeId(nodeId)}
      />
    );
  }

  return (
    <motion.div
      key="interpretations"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12 space-y-10"
    >
      <div className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] opacity-30 font-mono">LEKTURA</span>
        <h1 className="text-[32px] font-cormorant font-bold leading-tight tracking-tight">
          Interpretacje
        </h1>
        <p className="text-sm leading-relaxed opacity-40 max-w-[50ch] font-serif italic">
          Wiersz rozczytany na cząstki — słowa, frazy, obrazy, dźwięki, konteksty.
          Każda adnotacja otwiera inną warstwę.
        </p>
      </div>

      <div className="w-10 h-[1px] bg-ink/15" />

      <div className="space-y-3">
        {INTERPRETATION_POEMS.map((poem, i) => (
          <motion.button
            key={poem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedPoem(poem)}
            className="w-full text-left p-5 border border-ink/8 hover:border-ink/25 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-cormorant font-bold tracking-tight group-hover:opacity-100 opacity-80 transition-opacity">
                  {poem.title}
                </h3>
                <p className="text-[12px] font-mono opacity-30 mt-1">{poem.year}</p>
                <p className="text-sm opacity-40 mt-2 line-clamp-2 font-serif italic leading-relaxed">
                  {poem.content.split('\n').slice(0, 2).join(' / ')}
                </p>
              </div>
              <BookOpen size={16} strokeWidth={1.2} className="opacity-20 group-hover:opacity-50 transition-opacity shrink-0 mt-1" />
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-[11px] text-center opacity-20 max-w-[45ch] mx-auto leading-relaxed">
        Interpretacje generowane przez AI. Narzędzie edukacyjne.
      </p>
    </motion.div>
  );
};
