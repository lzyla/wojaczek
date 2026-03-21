import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface IntroViewProps {
  onStart: () => void;
}

export const IntroView = ({ onStart }: IntroViewProps) => (
  <motion.div
    key="intro"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[70vh]"
  >
    <div className="text-center">
      <h1 className="text-6xl font-cormorant font-bold tracking-tighter leading-none mb-2">
        Rafał
      </h1>
      <h1 className="text-6xl font-cormorant font-bold tracking-tighter leading-none">
        Wojaczek
      </h1>
    </div>

    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      onClick={onStart}
      whileTap={{ scale: 0.95 }}
      className="mt-16 w-12 h-12 btn-square no-radius"
    >
      <ArrowRight size={18} strokeWidth={1} />
    </motion.button>

    <p className="mt-10 text-2xl font-cormorant italic text-center leading-relaxed text-ink">
      Błądzę po mieście,<br />
      które jest mapą mojego obłędu.
    </p>
  </motion.div>
);
