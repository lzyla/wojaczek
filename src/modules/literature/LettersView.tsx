import { motion } from 'motion/react';
import { useData } from '../../services/data/dataService';

export const LettersView = () => {
  const { letters } = useData();
  return (
  <motion.div
    key="letters"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="space-y-12 py-12">
      <div className="space-y-4">
        <span className="label-ui text-seal">LISTY</span>
        <h2 className="text-5xl font-cormorant font-bold tracking-tighter">Korespondencja</h2>
      </div>
      <div className="space-y-8">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="p-8 border border-ink/10 no-radius space-y-6 hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="flex justify-between items-baseline">
              <span className="label-ui text-[10px] opacity-30">DO: {letter.to.toUpperCase()}</span>
              <span className="label-ui opacity-30">{letter.date}</span>
            </div>
            <p className="text-lg font-cormorant italic leading-relaxed opacity-80">
              „{letter.excerpt}"
            </p>
            <button className="label-ui text-[10px] text-seal opacity-0 group-hover:opacity-100 transition-opacity">
              CZYTAJ CAŁOŚĆ →
            </button>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
  );
};
