import { motion } from 'motion/react';
import { useData } from '../../services/data/dataService';

export const TimelineView = () => {
  const { timeline } = useData();
  return (
  <motion.div
    key="timeline"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="space-y-12 py-12">
      <div className="space-y-4">
        <span className="label-ui text-seal">CHRONOLOGIA</span>
        <h2 className="text-5xl font-cormorant font-bold tracking-tighter">Oś Czasu</h2>
      </div>
      <div className="relative border-l border-ink/10 ml-4 pl-12 space-y-16">
        {timeline.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute -left-[57px] top-1 w-3 h-3 rounded-full bg-seal shadow-sm"
            />
            <span className="label-ui text-seal block mb-2">{event.year}</span>
            <h3 className="text-2xl font-cormorant font-bold mb-4">{event.title}</h3>
            <p className="text-sm opacity-60 leading-relaxed">{event.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
  );
};
