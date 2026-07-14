import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, ChevronDown, ArrowUpRight } from 'lucide-react';
import type { InterpretationPoem, PoemNetwork, AnnotationNode } from '../../types';
import { loadInterpretation, getCachedNetwork } from '../../lib/interpretationService';

// ── Render annotation with VARIED formatting ──
// ── Clickable cross-reference links ──
const AnchorLinks = ({ connects_to, onLinkClick }: { connects_to: string[]; onLinkClick: (id: string) => void }) => {
  if (connects_to.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {connects_to.map(c => (
        <span
          key={c}
          onClick={(e) => { e.stopPropagation(); onLinkClick(c); }}
          className="text-[14px] font-serif text-ink/35 hover:text-ink/70 underline underline-offset-4 decoration-dotted decoration-ink/20 hover:decoration-ink/50 cursor-pointer transition-colors"
        >
          → {c}
        </span>
      ))}
    </div>
  );
};

const Annotation = ({ ann, index, onClick, onLinkClick }: { ann: AnnotationNode; index: number; onClick: () => void; onLinkClick: (id: string) => void }) => {
  const variant = index % 6;

  // Parse comment for **bold** and *italic* and _underline_ markers
  const formatText = (text: string) => {
    // Split into words and wrap key terms as clickable-looking elements
    return text;
  };

  // VARIANT 0: Single word/phrase highlighted large, centered, comment below
  if (ann.phrase && ann.phrase.split(' ').length <= 2 && variant % 3 === 0) {
    return (
      <button onClick={onClick} className="block w-full text-left group py-4">
        <p className="text-center font-serif text-[14px] font-bold tracking-[0.2em] uppercase text-ink/60 group-hover:text-ink transition-colors">
          {ann.phrase}
        </p>
        <div className="w-8 h-[1px] bg-ink/10 mx-auto my-2.5" />
        <p className="text-[14px] leading-[1.8] text-ink/50 text-center font-serif italic max-w-[38ch] mx-auto">
          {ann.comment}
        </p>
        {ann.alt_readings && ann.alt_readings.length > 0 && (
          <div className="mt-3 space-y-1">
            {ann.alt_readings.slice(0, 2).map((alt, i) => (
              <p key={i} className="text-[14px] text-ink/30 text-center font-serif">{alt}</p>
            ))}
          </div>
        )}
      </button>
    );
  }

  // VARIANT 1: Aside box — border all around, context/biography
  if (ann.aspect === 'biografia' || ann.aspect === 'kontekst' || variant === 1) {
    return (
      <button onClick={onClick} className="block w-full text-left group">
        <div className="border border-ink/10 p-4 relative hover:border-ink/20 transition-colors">
          {ann.phrase && (
            <p className="text-[14px] font-serif font-bold text-ink/50 mb-2 tracking-wide">{ann.phrase}</p>
          )}
          <p className="text-[14px] leading-[1.8] text-ink/65 group-hover:text-ink/85 transition-colors font-serif">
            {ann.comment}
          </p>
          <ArrowUpRight size={10} className="absolute top-3 right-3 opacity-0 group-hover:opacity-30 transition-opacity" />
        </div>
      </button>
    );
  }

  // VARIANT 2: Footnote style — number + inline text
  if (variant === 2) {
    return (
      <button onClick={onClick} className="block w-full text-left group py-1">
        <div className="flex gap-3 items-baseline">
          <span className="text-[14px] font-serif text-ink/25 shrink-0">{index + 1}.</span>
          <p className="text-[14px] leading-[1.8] text-ink/55 group-hover:text-ink/80 transition-colors font-serif">
            {ann.phrase && <span className="font-bold text-ink/70 mr-1">{ann.phrase}</span>}
            — {ann.comment}
          </p>
        </div>
      </button>
    );
  }

  // VARIANT 3: Border-left fragment — short gloss
  if (variant === 3 || ann.comment.length < 100) {
    return (
      <button onClick={onClick} className="block w-full text-left group py-1">
        <div className="border-l-[3px] border-ink/12 pl-4">
          {ann.phrase && (
            <p className="text-[14px] font-serif text-ink/40 underline underline-offset-4 decoration-ink/15 mb-1">{ann.phrase}</p>
          )}
          <p className="text-[14px] leading-[1.8] text-ink/55 group-hover:text-ink/75 transition-colors font-serif italic">
            {ann.comment}
          </p>
        </div>
      </button>
    );
  }

  // VARIANT 4: Full block with alt readings as list
  if (ann.alt_readings && ann.alt_readings.length > 0 && variant === 4) {
    return (
      <button onClick={onClick} className="block w-full text-left group">
        <div className="bg-ink/[0.03] p-4">
          {ann.phrase && (
            <p className="text-[14px] font-serif font-bold text-ink/60 mb-2">{ann.phrase}</p>
          )}
          <p className="text-[14px] leading-[1.8] text-ink/70 font-serif mb-3">{ann.comment}</p>
          <div className="border-t border-ink/8 pt-2.5 space-y-1.5">
            <p className="text-[10px] font-mono text-ink/25 uppercase tracking-[0.2em]">inne odczytania</p>
            {ann.alt_readings.map((alt, i) => (
              <p key={i} className="text-[14px] leading-[1.7] text-ink/40 pl-3 border-l border-ink/8 font-serif italic">{alt}</p>
            ))}
          </div>
        </div>
      </button>
    );
  }

  // VARIANT 5: Default — grey background block
  return (
    <button onClick={onClick} className="block w-full text-left group bg-ink/[0.04] hover:bg-ink/[0.06] p-4 transition-all">
      {ann.phrase && (
        <p className="text-[14px] font-serif text-ink/40 mb-1.5 underline decoration-dotted underline-offset-4 decoration-ink/20">{ann.phrase}</p>
      )}
      <p className="text-[14px] leading-[1.8] text-ink/75 group-hover:text-ink transition-colors font-serif">{ann.comment}</p>
      <AnchorLinks connects_to={ann.connects_to} onLinkClick={onLinkClick} />
    </button>
  );
};

// ── Main ──

interface Props {
  poem: InterpretationPoem;
  onBack: () => void;
  onNodeClick: (nodeId: string) => void;
}

export const InterpretPoemView = ({ poem, onBack, onNodeClick }: Props) => {
  const [network, setNetwork] = useState<PoemNetwork | null>(() => getCachedNetwork(poem.id) || null);
  const [loading, setLoading] = useState(!network);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  useEffect(() => {
    if (network) return;
    setLoading(true);
    loadInterpretation(poem.id)
      .then(n => { setNetwork(n); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [poem.id, network]);

  const toggleVerse = (vi: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(vi)) next.delete(vi); else next.add(vi);
      return next;
    });
  };

  const expandAll = () => {
    if (!network) return;
    const allOpen = expanded.size === network.verses.length;
    setExpanded(allOpen ? new Set() : new Set(network.verses.map((_, i) => i)));
  };

  // Scroll to a specific annotation node — open its verse if closed, then scroll
  const scrollToNode = (targetNodeId: string) => {
    if (!network) return;
    // Find which verse contains this node
    const verseIdx = network.verses.findIndex(v => v.annotations.some(a => a.node_id === targetNodeId));
    if (verseIdx === -1) return;
    // Expand that verse
    setExpanded(prev => new Set(prev).add(verseIdx));
    setHighlightedNode(targetNodeId);
    // Scroll after DOM updates
    setTimeout(() => {
      const el = document.getElementById(`ann-${targetNodeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash highlight
        el.classList.add('ring-2', 'ring-ink/20');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-ink/20');
          setHighlightedNode(null);
        }, 2000);
      }
    }, 100);
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
        <button onClick={onBack} className="flex items-center gap-2 opacity-40 hover:opacity-100 mb-8">
          <ArrowLeft size={16} strokeWidth={1.5} /><span className="text-[14px] font-serif">Powrót</span>
        </button>
        <div className="flex items-center gap-3 opacity-40">
          <RefreshCw size={14} className="animate-spin" />
          <span className="text-[14px] font-serif">Ładowanie...</span>
        </div>
      </motion.div>
    );
  }

  if (error || !network) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
        <button onClick={onBack} className="flex items-center gap-2 opacity-40 hover:opacity-100 mb-8">
          <ArrowLeft size={16} strokeWidth={1.5} /><span className="text-[14px] font-serif">Powrót</span>
        </button>
        <p className="text-[14px] font-serif opacity-50">{error || 'Błąd'}</p>
      </motion.div>
    );
  }

  let globalAnnIdx = 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
      <button onClick={onBack} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} /><span className="text-[14px] font-serif">Powrót</span>
      </button>

      <div className="flex items-baseline justify-between mb-10">
        <h2 className="text-[14px] font-serif font-bold uppercase tracking-[0.15em]">{poem.title}</h2>
        <span className="text-[10px] font-mono opacity-20">{poem.year}</span>
      </div>

      {/* ── Poem with accordion annotations ── */}
      {network.verses.map((verse, vi) => {
        const lines = verse.text.split('\n');
        const isOpen = expanded.has(vi);
        const hasAnns = verse.annotations.length > 0;
        const startIdx = globalAnnIdx;
        globalAnnIdx += verse.annotations.length;

        return (
          <div key={vi} className="mb-1">
            {/* Verse — clickable */}
            <div
              className={`relative py-1.5 ${hasAnns ? 'cursor-pointer group/v' : ''}`}
              onClick={() => hasAnns && toggleVerse(vi)}
            >
              {lines.map((line, li) => (
                <div
                  key={li}
                  className={`font-serif text-[14px] leading-[2.1] tracking-wide min-h-[1.8em] transition-all duration-300 ${
                    isOpen ? 'text-ink/60' : hasAnns ? 'group-hover/v:text-ink/60' : ''
                  }`}
                >
                  {line}
                </div>
              ))}
              {/* Margin indicator */}
              {hasAnns && !isOpen && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/v:opacity-100 transition-opacity flex items-center gap-1">
                  <ChevronDown size={12} className="text-ink/25" />
                </div>
              )}
            </div>

            {/* Annotations — only rendered when open */}
            {isOpen && hasAnns && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l border-ink/8 ml-2 pl-4 py-3 my-2 space-y-3"
              >
                {verse.annotations.map((ann, ai) => (
                  <motion.div
                    key={ann.node_id}
                    id={`ann-${ann.node_id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ai * 0.06 }}
                    className={`transition-all duration-500 rounded ${highlightedNode === ann.node_id ? 'ring-2 ring-ink/20 bg-ink/[0.06]' : ''}`}
                  >
                    <Annotation ann={ann} index={startIdx + ai} onClick={() => onNodeClick(ann.node_id)} onLinkClick={scrollToNode} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        );
      })}

      {/* Expand all */}
      <button
        onClick={expandAll}
        className="w-full mt-6 py-3 border border-ink/8 hover:border-ink/20 transition-all flex items-center justify-center gap-2"
      >
        <ChevronDown size={14} className={`opacity-25 transition-transform ${expanded.size === network.verses.length ? 'rotate-180' : ''}`} />
        <span className="text-[14px] font-serif text-ink/45 hover:text-ink/70 transition-colors">
          {expanded.size === network.verses.length ? 'Zamknij warstwy' : 'Otwórz wszystkie warstwy'}
        </span>
      </button>

      {/* Summary when all expanded */}
      {expanded.size === network.verses.length && network.network_summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
          <div className="w-10 h-[1px] bg-ink/8 mb-4" />
          <p className="text-[14px] leading-[1.8] text-ink/40 font-serif border-l border-ink/8 pl-4">{network.network_summary}</p>
        </motion.div>
      )}

      <p className="text-[10px] text-center opacity-12 mt-12 font-mono">kliknij w wers · odsłoń interpretację</p>
    </motion.div>
  );
};
