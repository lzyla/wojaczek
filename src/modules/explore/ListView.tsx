import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { Point, ViewId } from '../../types';

interface ListViewProps {
  onSelectPoint: (point: Point) => void;
  onShowMockups: () => void;
  onNavigate: (view: ViewId) => void;
}

export const ListView = ({ onSelectPoint, onShowMockups, onNavigate }: ListViewProps) => {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-0"
    >
      <div className="mb-8 mt-8">
        <h1 className="text-6xl font-cormorant font-bold tracking-tighter leading-none mb-6">Nie było</h1>

        {/* Glassmorphism tabs */}
        <div
          className="flex gap-0 rounded-lg overflow-hidden shadow-sm"
          style={{ background: 'rgba(232, 230, 227, 0.4)', backdropFilter: 'blur(12px)' }}
        >
          <button
            className="flex-1 py-3 label-ui text-[9px] transition-all bg-ink/90 text-white backdrop-blur-sm rounded-l-lg"
          >
            Opis
          </button>
          <button
            onClick={() => onNavigate('trail')}
            className="flex-1 py-3 label-ui text-[9px] transition-all text-ink/60 hover:text-ink hover:bg-white/60 backdrop-blur-sm rounded-r-lg"
          >
            Ścieżka
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div ref={imgRef} className="rounded-xl overflow-hidden shadow-sm">
          <motion.img
            src="https://upload.wikimedia.org/wikipedia/commons/9/99/Deptak_wzd%C5%82u%C5%BC_pieknych_kamienic_-_panoramio.jpg"
            alt="Mikołów"
            className="w-full aspect-[4/3] object-cover grayscale contrast-125 brightness-75 scale-115"
            style={{ y: imgY }}
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="text-literary text-sm leading-relaxed">
          „Nie ma mnie, ale jestem tu wszędzie. W każdym pęknięciu muru, w każdym oddechu tego miasta." Śladami Rafała Wojaczka przez Mikołów — miasto, które ukształtowało poetę i które poeta naznaczył swoimi słowami na zawsze.
        </p>

        <p className="text-sm leading-relaxed opacity-60">
          Interaktywna ścieżka po miejscach związanych z życiem i twórczością jednego z najważniejszych polskich poetów XX wieku. Każde miejsce to osobna historia, dźwięk, obraz i słowo.
        </p>

        {/* Decorative separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="h-px bg-mist-light origin-left"
        />
      </div>
    </motion.div>
  );
};
