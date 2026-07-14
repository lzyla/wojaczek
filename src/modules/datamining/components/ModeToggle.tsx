import type { AnalysisMode } from '../types';

interface ModeToggleProps {
  mode: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export const ModeToggle = ({ mode, onChange }: ModeToggleProps) => {
  return (
    <div className="flex border border-ink/10">
      <button
        onClick={() => onChange('poem')}
        className={`flex-1 py-2.5 font-mono text-xs tracking-wider transition-colors ${
          mode === 'poem'
            ? 'bg-ink text-white'
            : 'bg-transparent text-ink/50 hover:text-ink'
        }`}
      >
        Per wiersz
      </button>
      <button
        onClick={() => onChange('corpus')}
        className={`flex-1 py-2.5 font-mono text-xs tracking-wider transition-colors ${
          mode === 'corpus'
            ? 'bg-ink text-white'
            : 'bg-transparent text-ink/50 hover:text-ink'
        }`}
      >
        Cala tworczosc
      </button>
    </div>
  );
};
