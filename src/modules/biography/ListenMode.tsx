import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { BIOGRAPHY_FULL_TEXT } from './biographyData';

// Split text into sentences
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or newline
  const raw = text.split(/(?<=[.!?…])\s+/);
  return raw.filter((s) => s.trim().length > 0);
}

export const ListenMode = () => {
  const sentences = useMemo(() => splitIntoSentences(BIOGRAPHY_FULL_TEXT), []);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stoppedRef = useRef(false);

  // Speak a single sentence, returns a promise
  const speakSentence = useCallback(
    (index: number): Promise<void> =>
      new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
          reject(new Error('No speech synthesis'));
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentences[index]);
        utterance.lang = 'pl-PL';
        utterance.rate = 0.8;
        utterance.pitch = 0.85;
        utterance.volume = 0.9;

        const voices = speechSynthesis.getVoices();
        const polishVoice = voices.find((v) => v.lang.startsWith('pl'));
        if (polishVoice) utterance.voice = polishVoice;

        utteranceRef.current = utterance;

        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          if (e.error === 'canceled' || e.error === 'interrupted') {
            resolve();
          } else {
            reject(e);
          }
        };

        speechSynthesis.speak(utterance);
      }),
    [sentences]
  );

  // Play all sentences from a starting index
  const playFrom = useCallback(
    async (startIndex: number) => {
      stoppedRef.current = false;
      setIsPlaying(true);

      for (let i = startIndex; i < sentences.length; i++) {
        if (stoppedRef.current) break;

        setCurrentIndex(i);
        setProgress(((i + 1) / sentences.length) * 100);

        // Scroll into view
        sentenceRefs.current[i]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        try {
          await speakSentence(i);
        } catch {
          break;
        }
      }

      if (!stoppedRef.current) {
        setCurrentIndex(-1);
        setProgress(100);
      }
      setIsPlaying(false);
    },
    [sentences, speakSentence]
  );

  const stop = useCallback(() => {
    stoppedRef.current = true;
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setCurrentIndex(-1);
    setProgress(0);
  }, [stop]);

  const handleSentenceClick = useCallback(
    (index: number) => {
      stop();
      setTimeout(() => playFrom(index), 100);
    },
    [stop, playFrom]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div>
      {/* Audio controls */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pb-4 mb-8 border-b border-ink/8">
        <div className="flex items-center gap-4">
          {isPlaying ? (
            <button
              onClick={stop}
              className="w-10 h-10 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
            >
              <Pause size={16} />
            </button>
          ) : (
            <button
              onClick={() => playFrom(currentIndex >= 0 ? currentIndex : 0)}
              className="w-10 h-10 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
            >
              <Play size={16} className="ml-0.5" />
            </button>
          )}

          <button
            onClick={reset}
            className="w-10 h-10 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-1 bg-ink/8 relative">
            <div
              className="absolute inset-y-0 left-0 bg-ink/40 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="label-ui text-mist-dark text-[9px] shrink-0">
            {currentIndex >= 0 ? currentIndex + 1 : 0} / {sentences.length}
          </span>
        </div>

        {!window.speechSynthesis && (
          <p className="text-xs text-seal mt-2">
            Twoja przeglądarka nie obsługuje syntezy mowy.
          </p>
        )}
      </div>

      {/* Text with highlighting */}
      <div className="text-[15px] leading-[1.85]">
        {sentences.map((sentence, i) => (
          <span
            key={i}
            ref={(el) => { sentenceRefs.current[i] = el; }}
            onClick={() => handleSentenceClick(i)}
            className={`cursor-pointer transition-all duration-300 ${
              i === currentIndex
                ? 'bg-seal/10 text-ink'
                : currentIndex >= 0 && i !== currentIndex
                  ? 'text-ink/25'
                  : 'text-ink/80 hover:text-ink'
            }`}
          >
            {sentence}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};
