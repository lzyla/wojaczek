import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  duration: string;
}

export const AudioPlayer = ({ duration }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="my-12">
      <div className="flex items-center gap-8">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-14 h-14 btn-square no-radius"
        >
          {isPlaying ? <Pause size={24} strokeWidth={1} /> : <Play size={24} strokeWidth={1} />}
        </button>
        <div className="flex-1">
          <div className="h-[1px] bg-ink/10 w-full relative">
            <motion.div
              className="absolute h-[1px] bg-ink left-0 top-0"
              animate={{ width: isPlaying ? '100%' : '0%' }}
              transition={{ duration: 120, ease: "linear" }}
            />
          </div>
          <div className="flex justify-between mt-3">
            <span className="label-ui opacity-30">0:00</span>
            <span className="label-ui">{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
