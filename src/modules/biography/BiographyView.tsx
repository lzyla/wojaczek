import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, Headphones, MessageCircle, Library } from 'lucide-react';
import { ReadMode } from './ReadMode';
import { TimelineMode } from './TimelineMode';
import { ListenMode } from './ListenMode';
import { PoetChat } from './PoetChat';
import { BibliotekaMode } from './BibliotekaMode';

type Mode = 'read' | 'timeline' | 'listen' | 'chat' | 'library';

const TABS: { id: Mode; label: string; icon: typeof BookOpen }[] = [
  { id: 'read', label: 'Czytaj', icon: BookOpen },
  { id: 'timeline', label: 'Oś czasu', icon: Clock },
  { id: 'listen', label: 'Posłuchaj', icon: Headphones },
  { id: 'chat', label: 'Czat', icon: MessageCircle },
  { id: 'library', label: 'Biblioteka', icon: Library },
];

export const BiographyView = () => {
  const [mode, setMode] = useState<Mode>('read');
  const portraitRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <motion.div
      key="biography"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Portrait - parallax with rounded top */}
      <div ref={portraitRef} className="rounded-t-xl overflow-hidden mt-4">
        <motion.img
          src="/images/wojaczek-portret.jpg"
          alt="Rafał Wojaczek"
          className="w-full aspect-[3/4] object-cover object-center grayscale contrast-125 brightness-90 scale-115"
          style={{ y: imgY }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Title */}
      <div className="mt-10 mb-8">
        <span className="label-ui text-mist-dark text-[12px]">1945 — 1971</span>
        <h2 className="text-5xl font-cormorant font-bold tracking-tighter leading-none mt-3">
          Życiorys
        </h2>
      </div>

      {/* Tabs — scrollable with fade hint */}
      <div className="relative mb-10">
        <div className="flex gap-0 border border-ink/10 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink/60 hover:text-ink hover:bg-mist-light/30'
                }`}
              >
                <Icon size={13} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Fade hint — right edge gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Mode content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="pb-24"
        >
          {mode === 'read' && <ReadMode />}
          {mode === 'timeline' && <TimelineMode />}
          {mode === 'listen' && <ListenMode />}
          {mode === 'chat' && <PoetChat embedded />}
          {mode === 'library' && <BibliotekaMode />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
