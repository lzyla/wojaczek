import type { FC } from 'react';
import { motion } from 'motion/react';
import type { GalleryImage } from '../../../types';

interface GalleryItemProps {
  item: GalleryImage;
}

export const GalleryItem: FC<GalleryItemProps> = ({ item }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="space-y-6 group cursor-pointer"
  >
    <div className="aspect-[3/4] border border-ink/10 no-radius overflow-hidden relative">
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
    <div className="flex justify-between items-baseline">
      <span className="label-ui text-[10px] opacity-30">{item.id}</span>
      <span className="label-ui text-seal">{item.title}</span>
    </div>
  </motion.div>
);
