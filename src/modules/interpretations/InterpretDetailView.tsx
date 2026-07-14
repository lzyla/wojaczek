import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Zap, BookOpen, User, Hash } from 'lucide-react';
import type { InterpretationPoem, AnnotationNode } from '../../types';
import { getCachedNetwork } from '../../lib/interpretationService';

/** Parse [BIOGRAFIA: ...] and [INTERTEKST: ...] into styled elements */
const RichText = ({ text }: { text: string }) => {
  const parts = useMemo(() => {
    const regex = /\[(BIOGRAFIA|INTERTEKST):\s*([^\]]+)\]/g;
    const result: { type: 'text' | 'bio' | 'inter'; content: string }[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex)
        result.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      result.push({ type: match[1] === 'BIOGRAFIA' ? 'bio' : 'inter', content: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length)
      result.push({ type: 'text', content: text.slice(lastIndex) });
    return result;
  }, [text]);

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === 'bio')
          return <span key={i} className="inline-flex items-center gap-1 bg-ink/[0.06] px-1.5 py-0.5 text-[11px] font-mono text-ink/60 rounded-sm mx-0.5 align-baseline"><User size={9} className="opacity-40" />{p.content}</span>;
        if (p.type === 'inter')
          return <span key={i} className="inline-flex items-center gap-1 bg-ink/[0.06] px-1.5 py-0.5 text-[11px] font-mono text-ink/60 italic rounded-sm mx-0.5 align-baseline"><BookOpen size={9} className="opacity-40" />{p.content}</span>;
        return <span key={i}>{p.content}</span>;
      })}
    </>
  );
};

interface Props {
  poem: InterpretationPoem;
  nodeId: string;
  onBack: () => void;
  onNavigateNode: (nodeId: string) => void;
}

export const InterpretDetailView = ({ poem, nodeId, onBack, onNavigateNode }: Props) => {
  const network = getCachedNetwork(poem.id);

  const { node, verseText } = useMemo(() => {
    if (!network) return { node: null, verseText: '' };
    for (const verse of network.verses) {
      const found = verse.annotations.find(a => a.node_id === nodeId);
      if (found) return { node: found, verseText: verse.text };
    }
    return { node: null, verseText: '' };
  }, [network, nodeId]);

  const connectedNodes = useMemo(() => {
    if (!network || !node) return [];
    const nodes: { node: AnnotationNode; verse: string }[] = [];
    for (const cid of node.connects_to) {
      for (const verse of network.verses)
        for (const a of verse.annotations)
          if (a.node_id === cid) nodes.push({ node: a, verse: verse.text });
    }
    return nodes;
  }, [network, node]);

  const contradiction = useMemo(() => {
    if (!network || !node?.contradicts) return null;
    for (const verse of network.verses)
      for (const a of verse.annotations)
        if (a.node_id === node.contradicts) return { node: a, verse: verse.text };
    return null;
  }, [network, node]);

  // Collect all other annotations from the same verse for cross-linking
  const siblingAnnotations = useMemo(() => {
    if (!network || !node) return [];
    for (const verse of network.verses) {
      if (verse.annotations.some(a => a.node_id === nodeId)) {
        return verse.annotations.filter(a => a.node_id !== nodeId);
      }
    }
    return [];
  }, [network, node, nodeId]);

  if (!node) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
        <button onClick={onBack} className="flex items-center gap-2 opacity-40 hover:opacity-100 mb-8">
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span className="text-sm">Powrót do wiersza</span>
        </button>
        <p className="text-sm opacity-50">Nie znaleziono.</p>
      </motion.div>
    );
  }

  const paragraphs = node.full_analysis.split(/\\n\\n|\n\n/).filter(p => p.trim());

  return (
    <motion.div
      key={nodeId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12"
    >
      <button onClick={onBack} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity mb-8">
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span className="text-sm">Powrót do wiersza</span>
      </button>

      {/* ── Header: phrase as title ── */}
      {node.phrase ? (
        <div className="mb-8">
          <p className="font-serif text-[14px] font-bold tracking-widest leading-tight text-ink/90 uppercase">
            {node.phrase}
          </p>
          <div className="border-l-[3px] border-ink/10 pl-4 py-2 mt-4">
            <p className="font-serif text-[14px] leading-[1.7] italic text-ink/35 whitespace-pre-line">
              {verseText}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-l-[3px] border-ink/15 pl-5 py-3 mb-8">
          <p className="font-serif text-[14px] leading-[1.8] italic text-ink/50 whitespace-pre-line">
            {verseText}
          </p>
        </div>
      )}

      <div className="w-8 h-[1px] bg-ink/8 mb-8" />

      {/* ── Main analysis — varied layout ── */}
      <div className="space-y-5 max-w-[60ch]">
        {paragraphs.map((para, i) => {
          // Vary paragraph styles for liberature effect
          if (i === 0) {
            // First paragraph: large initial, serif
            return (
              <p key={i} className="text-[14px] leading-[1.85] text-ink/70 font-serif first-letter:font-bold first-letter:text-ink/80">
                <RichText text={para} />
              </p>
            );
          }
          if (para.length < 80) {
            // Short paragraph: centered, italic, like an aside
            return (
              <p key={i} className="text-[14px] text-center text-ink/50 italic font-serif py-2">
                <RichText text={para} />
              </p>
            );
          }
          if (i === paragraphs.length - 1 && paragraphs.length > 2) {
            // Last paragraph: slightly different style — concluding
            return (
              <div key={i} className="border-t border-ink/8 pt-4">
                <p className="text-[14px] leading-[1.85] text-ink/60 font-serif">
                  <RichText text={para} />
                </p>
              </div>
            );
          }
          // Regular paragraph
          return (
            <p key={i} className="text-[14px] leading-[1.85] text-ink/65 font-serif">
              <RichText text={para} />
            </p>
          );
        })}
      </div>

      {/* ── Alternative readings — distinct visual treatment ── */}
      {node.alt_readings && node.alt_readings.length > 0 && (
        <div className="mt-8 space-y-0">
          <div className="flex items-center gap-2 mb-3">
            <Hash size={11} className="opacity-25" />
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] opacity-25">alternatywne odczytania</span>
          </div>
          {node.alt_readings.map((alt, i) => (
            <div key={i} className="py-2.5 border-b border-ink/5 last:border-0">
              <div className="flex gap-3">
                <span className="text-[9px] font-mono text-ink/20 mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-[14px] leading-[1.7] text-ink/50 font-serif italic">
                  {alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Sibling annotations from same verse ── */}
      {siblingAnnotations.length > 0 && (
        <div className="mt-8">
          <span className="text-[9px] font-mono uppercase tracking-[0.25em] opacity-20 mb-3 block">
            przy tym samym wersie
          </span>
          <div className="space-y-1.5">
            {siblingAnnotations.map(sib => (
              <button
                key={sib.node_id}
                onClick={() => onNavigateNode(sib.node_id)}
                className="block w-full text-left py-2 px-3 hover:bg-ink/[0.03] transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <ArrowUpRight size={10} className="opacity-20 mt-1 shrink-0" />
                  <div>
                    {sib.phrase && <span className="text-[10px] font-mono text-ink/30 mr-1">{sib.phrase}</span>}
                    <span className="text-[12px] text-ink/40 group-hover:text-ink/60 transition-colors">
                      {sib.comment.substring(0, 80)}...
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Connected nodes ── */}
      {connectedNodes.length > 0 && (
        <div className="mt-8">
          <span className="text-[9px] font-mono uppercase tracking-[0.25em] opacity-20 mb-3 block">
            powiązania
          </span>
          <div className="space-y-2">
            {connectedNodes.map(({ node: cn }) => (
              <button
                key={cn.node_id}
                onClick={() => onNavigateNode(cn.node_id)}
                className="block w-full text-left p-3.5 border border-ink/6 hover:border-ink/15 transition-all group"
              >
                {cn.phrase && (
                  <p className="text-[11px] font-mono text-ink/35 mb-1">{cn.phrase}</p>
                )}
                <p className="text-[14px] leading-[1.6] text-ink/50 group-hover:text-ink/70 transition-colors">
                  {cn.comment.substring(0, 100)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Contradiction ── */}
      {contradiction && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={11} className="opacity-25" />
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] opacity-20">inne spojrzenie</span>
          </div>
          {node.contradiction_reason && (
            <p className="text-[11px] text-ink/35 font-serif italic mb-2">{node.contradiction_reason}</p>
          )}
          <button
            onClick={() => onNavigateNode(contradiction.node.node_id)}
            className="block w-full text-left p-3.5 border border-ink/8 border-dashed hover:border-ink/20 transition-all group"
          >
            {contradiction.node.phrase && (
              <p className="text-[11px] font-mono text-ink/35 mb-1">{contradiction.node.phrase}</p>
            )}
            <p className="text-[14px] leading-[1.6] text-ink/50 group-hover:text-ink/70 transition-colors">
              {contradiction.node.comment.substring(0, 120)}...
            </p>
          </button>
        </div>
      )}

      <div className="h-16" />
    </motion.div>
  );
};
