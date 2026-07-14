import { motion } from 'motion/react';
import { Camera, Clock, Layers, X } from 'lucide-react';
import { MiniMap } from './components/MiniMap';
import { AudioPlayer } from './components/AudioPlayer';
import { MediaBlockRenderer } from './components/MediaBlocks';
import { useData } from '../../services/data/dataService';
import type { Point } from '../../types';

interface DetailViewProps {
  point: Point;
  aiReflection: string | null;
  aiImage: string | null;
  isGenerating: boolean;
  hasGeminiKey: boolean;
  onBack: () => void;
  onGenerate: () => void;
  onOpenKeyDialog: () => void;
  onSelectPoint: (point: Point) => void;
  onOpenAr: () => void;
}

export const DetailView = ({
  point,
  onBack,
  onSelectPoint,
  onOpenAr,
}: DetailViewProps) => {
  const { points } = useData();
  return (
  <motion.div
    key="detail"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="space-y-8"
  >
    {/* Map - full width, no margins */}
    <div className="-mx-8">
      <MiniMap lat={point.lat} lng={point.lng} />
    </div>

    {/* Featured image - rounded corners */}
    <div className="rounded-xl overflow-hidden shadow-sm">
      <img
        src={point.imageUrl}
        alt={point.title}
        className="w-full aspect-[4/3] object-cover object-center"
        referrerPolicy="no-referrer"
      />
    </div>

    {/* Data badges */}
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Clock size={12} className="text-mist" />
        <span className="label-ui">{point.duration}</span>
      </div>
      <div className="flex items-center gap-2">
        <Layers size={12} className="text-mist" />
        <span className="label-ui">{point.resourceCount || point.media?.length || 0} zasobów</span>
      </div>
    </div>

    {/* Title & category */}
    <div>
      <span className="label-ui text-seal">{point.category}</span>
      <h2 className="text-4xl mt-2 leading-[0.85] tracking-tighter">{point.title}</h2>
    </div>

    {/* Short description */}
    <p className="text-sm leading-relaxed opacity-70">{point.description}</p>

    {point.arExperience && (
      <div className="rounded-2xl border border-seal/15 bg-seal/[0.04] p-5">
        <span className="label-ui text-seal">NA MIEJSCU</span>
        <h3 className="mt-2 text-2xl">{point.arExperience.title}</h3>
        <p className="mt-2 text-sm leading-relaxed opacity-70">{point.arExperience.hint}</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenAr}
          className="mt-5 w-full bg-seal px-4 py-4 text-white"
        >
          <span className="label-ui flex items-center justify-center gap-3">
            <Camera size={14} />
            Otwórz kamerę AR
          </span>
        </motion.button>
      </div>
    )}

    {/* Narrator / Audio Player */}
    <AudioPlayer duration={point.duration} />

    {/* Dynamic media blocks */}
    {point.media && point.media.length > 0 && (
      <div className="space-y-10 pt-4">
        {point.media.map((block, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.03, duration: 0.5 }}
          >
            <MediaBlockRenderer block={block} />
          </motion.div>
        ))}
      </div>
    )}

    {/* Related Places */}
    <div className="space-y-8 pt-8 border-t border-mist-light">
      <span className="label-ui text-mist">POWIĄZANE MIEJSCA</span>
      <div className="space-y-4">
        {points.filter(p => p.id !== point.id).slice(0, 2).map(p => (
          <div
            key={p.id}
            onClick={() => onSelectPoint(p)}
            className="flex items-center gap-6 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm">
              <img src={p.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            </div>
            <span className="label-ui group-hover:text-seal transition-colors">{p.title}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Close button */}
    <div className="pt-8 pb-24">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="w-full py-4 btn-square no-radius flex items-center justify-center gap-3"
      >
        <X size={14} />
        <span className="label-ui">Zamknij</span>
      </motion.button>
    </div>
  </motion.div>
  );
};
