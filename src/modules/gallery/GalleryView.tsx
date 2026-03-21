import { motion } from 'motion/react';
import { GalleryItem } from './components/GalleryItem';
import { useData } from '../../services/data/dataService';

export const GalleryView = () => {
  const { gallery } = useData();
  return (
  <motion.div
    key="gallery"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-24 py-12"
  >
    <div className="space-y-4">
      <span className="label-ui text-seal">GALERIA</span>
      <h2 className="text-5xl font-cormorant font-bold tracking-tighter">Ślady Miasta</h2>
    </div>

    <div className="grid grid-cols-2 gap-12">
      {gallery.map(item => (
        <GalleryItem key={item.id} item={item} />
      ))}
    </div>
  </motion.div>
  );
};
