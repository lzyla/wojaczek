import { motion } from 'motion/react';
import { X, Clock, Layers, Navigation } from 'lucide-react';
import { MediaBlockRenderer } from './MediaBlocks';
import type { Point } from '../../../types';

interface PlacePreviewProps {
  point: Point;
  onClose: () => void;
  onNavigate: () => void;
}

export const PlacePreview = ({ point, onClose, onNavigate }: PlacePreviewProps) => {
  const totalMedia = point.media?.length || 0;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/15 z-[60]"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[61] rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.12)]"
        style={{ background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-mist rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-mist-light rounded-full flex items-center justify-center z-10 hover:bg-mist transition-colors"
        >
          <X size={14} />
        </button>

        {/* Hero image */}
        <div className="aspect-[3/2] overflow-hidden mx-4 mt-2 rounded-xl">
          <img
            src={point.imageUrl}
            alt={point.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Title & category */}
          <div>
            <span className="label-ui text-seal text-[8px]">{point.category}</span>
            <h2 className="text-3xl font-cormorant font-bold tracking-tighter leading-tight mt-1">{point.title}</h2>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-mist" />
              <span className="label-ui text-[9px]">{point.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-mist" />
              <span className="label-ui text-[9px]">{point.resourceCount || totalMedia} zasobów</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed opacity-70">{point.description}</p>

          {/* All media blocks - fully visible */}
          {point.media && point.media.length > 0 && (
            <div className="space-y-6">
              {point.media.map((block, i) => (
                <MediaBlockRenderer key={i} block={block} />
              ))}
            </div>
          )}

          {/* Navigate button */}
          <motion.button
            onClick={onNavigate}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-ink text-white label-ui no-radius flex items-center justify-center gap-3 hover:bg-ink/80 transition-colors"
          >
            <Navigation size={14} />
            Nawiguj do tego miejsca
          </motion.button>

          <div className="h-4" />
        </div>
      </motion.div>
    </>
  );
};
