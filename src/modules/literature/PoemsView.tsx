import { motion } from 'motion/react';
import { PoemCard } from './components/PoemCard';
import { useData } from '../../services/data/dataService';

export const PoemsView = () => {
  const { poems } = useData();
  return (
  <motion.div
    key="poems"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-12 py-12"
  >
    <div className="space-y-4">
      <span className="label-ui text-seal">POEZJA</span>
      <h2 className="text-4xl font-cormorant font-bold tracking-tighter mt-3">Słowa Krwi</h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="h-px bg-mist-light origin-left mt-4"
      />
    </div>

    <div className="space-y-4">
      {poems.map(p => (
        <PoemCard key={p.id} poem={p} />
      ))}
    </div>
  </motion.div>
  );
};
