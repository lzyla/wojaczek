import { ChevronRight } from 'lucide-react';
import type { AnalysisType } from '../types';

interface AnalysisCardProps {
  analysis: AnalysisType;
  onClick: () => void;
}

export const AnalysisCard = ({ analysis, onClick }: AnalysisCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border-b border-ink/8 py-3.5 px-1 flex items-start gap-3 transition-colors hover:bg-ink/[0.02] active:bg-ink/[0.05]"
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block">{analysis.label}</span>
        <span className="text-[11px] text-ink/40 block mt-0.5 leading-snug">
          {analysis.description}
        </span>
      </div>
      <ChevronRight size={14} strokeWidth={1.5} className="text-ink/20 mt-1 shrink-0" />
    </button>
  );
};
