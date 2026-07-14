import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface IntroViewProps {
  onStart: () => void;
}

const name = 'Rafał Wojaczek';
const quote = 'Błądzę po mieście, które jest mapą mojego obłędu.';

export const IntroView = ({ onStart }: IntroViewProps) => (
  <motion.div
    key="intro"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[75vh] relative overflow-hidden"
  >
    {/* Dust particles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-[2px] h-[2px] rounded-full bg-ink/15"
        style={{
          left: `${15 + i * 14}%`,
          top: `${20 + (i % 3) * 25}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}

    {/* Name — letter by letter */}
    <div className="text-center relative z-10">
      <div className="flex justify-center overflow-hidden">
        {name.split('').map((char, i) => (
          <motion.span
            key={i}
            className="text-4xl font-cormorant font-bold tracking-tighter leading-none"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: i * 0.01,
              duration: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>

      {/* Red line */}
      <motion.div
        className="h-[1px] bg-[#c23030] mx-auto mt-4"
        initial={{ width: 0 }}
        animate={{ width: 40 }}
        transition={{ delay: 0.15, duration: 0.2, ease: 'easeOut' }}
      />

      {/* Years */}
      <motion.p
        className="font-mono text-[10px] tracking-[0.3em] opacity-30 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        1945 — 1971
      </motion.p>
    </div>

    {/* Quote — word by word */}
    <div className="mt-12 text-center relative z-10 px-4">
      {quote.split(' ').map((word, i) => (
        <motion.span
          key={i}
          className="text-xl font-cormorant italic text-ink/80 inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.25 + i * 0.02,
            duration: 0.15,
            ease: 'easeOut',
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>

    {/* Enter button */}
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.15 }}
      onClick={onStart}
      whileTap={{ scale: 0.9 }}
      className="mt-14 w-12 h-12 border border-ink/20 flex items-center justify-center hover:bg-ink hover:text-white transition-all duration-300"
    >
      <ArrowRight size={18} strokeWidth={1} />
    </motion.button>
  </motion.div>
);
