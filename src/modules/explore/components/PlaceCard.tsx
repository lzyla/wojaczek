import type { FC } from 'react';
import { motion } from 'motion/react';
import type { Point } from '../../../types';

interface PlaceCardProps {
  point: Point;
  onClick: () => void;
}

export const PlaceCard: FC<PlaceCardProps> = ({ point, onClick }) => (
  <motion.div
    whileTap={{ backgroundColor: '#ffffff' }}
    onClick={onClick}
    className="flex gap-4 py-5 border-b border-ink/10 cursor-pointer group no-radius last:border-0"
  >
    <div className="w-20 h-20 no-radius overflow-hidden border border-ink/5 flex-shrink-0">
      <img
        src={point.imageUrl}
        alt={point.title}
        className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="flex-1 flex flex-col justify-center">
      <span className="label-ui text-seal mb-1.5 text-[8px] tracking-widest">{point.category}</span>
      <h3 className="text-xl font-cormorant font-bold leading-tight tracking-tight">{point.title}</h3>
    </div>
  </motion.div>
);
