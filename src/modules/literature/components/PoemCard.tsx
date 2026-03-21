import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { Play, Pause, Share2 } from 'lucide-react';
import type { Poem } from '../../../types';

const AUDIO_MAP: Record<string, string> = {
  p1: '/audio/sezon.mp3',
  p2: '/audio/ktory-skrzywdzil.mp3',
  p3: '/audio/ktory-nie-byl.mp3',
  p4: '/audio/prosba.mp3',
  p5: '/audio/w-miescie.mp3',
};

interface PoemCardProps {
  poem: Poem;
}

export const PoemCard: FC<PoemCardProps> = ({ poem }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = AUDIO_MAP[poem.id];

  const togglePlay = () => {
    if (!audioSrc) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.addEventListener('timeupdate', () => {
        const a = audioRef.current!;
        setProgress(a.duration ? a.currentTime / a.duration : 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6 py-8 px-4 -mx-4 rounded-xl border-b border-mist-light/50 last:border-0 group hover:bg-mist-light/10 transition-colors">
      <div className="flex justify-between items-baseline">
        <h3 className="text-2xl font-cormorant font-bold tracking-tighter group-hover:text-seal transition-colors">{poem.title}</h3>
        <span className="label-ui text-mist-dark text-[12px]">{poem.year}</span>
      </div>
      <div className="text-base leading-relaxed font-cormorant italic opacity-80 whitespace-pre-line">
        {poem.content}
      </div>

      {/* Audio player */}
      {audioSrc && (
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              isPlaying
                ? 'bg-seal text-white shadow-md'
                : 'border border-ink/20 hover:bg-ink hover:text-white'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </motion.button>
          <div className="flex-1">
            <div className="h-[2px] bg-ink/10 w-full rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-seal"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
          <span className="label-ui text-mist-dark text-[8px]">
            {isPlaying ? 'ODTWARZANIE' : 'POSŁUCHAJ'}
          </span>
        </div>
      )}

      {!audioSrc && (
        <div className="flex gap-4">
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="btn-square w-10 h-10 no-radius opacity-30 hover:opacity-100 hover:bg-ink hover:text-white transition-all"
          >
            <Play size={14} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="btn-square w-10 h-10 no-radius opacity-30 hover:opacity-100 hover:bg-ink hover:text-white transition-all"
          >
            <Share2 size={14} />
          </motion.button>
        </div>
      )}
    </div>
  );
};
