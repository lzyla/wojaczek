import { motion } from 'motion/react';
import { useData } from '../../services/data/dataService';

export const ReflectionsView = () => {
  const { points } = useData();
  return (
  <motion.div
    key="reflections"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-12"
  >
    <div className="space-y-4">
      <span className="label-ui text-seal">AI WIZJE</span>
      <h2 className="text-5xl font-cormorant font-bold tracking-tighter">Metafizyka</h2>
    </div>
    <p className="label-ui opacity-40">Galeria Wizji AI • Ślady Obecności</p>

    <div className="grid grid-cols-1 gap-24">
      {points.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-8 group"
        >
          <div className="aspect-video border border-ink/10 no-radius overflow-hidden relative">
            <img
              src={`https://picsum.photos/seed/vision${p.id}/800/450?grayscale&blur=2`}
              alt={p.title}
              className="w-full h-full object-cover grayscale contrast-150 group-hover:contrast-125 group-hover:brightness-110 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="label-ui text-[10px] opacity-30">WIZJA {String(i + 1).padStart(2, '0')}</span>
            <span className="label-ui text-seal">{p.title}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
  );
};
