import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RefreshCw, Volume2 } from 'lucide-react';
import { usePoetryGenerator } from '../../hooks/usePoetryGenerator';

// --- Typewriter: shows text character by character ---
const Typewriter = ({ text, speed = 45 }: { text: string; speed?: number }) => {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const textRef = useRef(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Always keep the latest text in ref (no effect restart needed)
  textRef.current = text;

  // Reset only when text is cleared (new poem)
  const isEmpty = text === '';
  useEffect(() => {
    if (isEmpty) {
      indexRef.current = 0;
      setDisplayed('');
    }
  }, [isEmpty]);

  // Single interval that runs for the lifetime of the component
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const currentText = textRef.current;
      if (indexRef.current < currentText.length) {
        indexRef.current++;
        setDisplayed(currentText.slice(0, indexRef.current));
      }
      // Don't clear interval — just wait for more text from stream
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speed]);

  // Split displayed text into lines for styling
  const lines = useMemo(() => displayed.split('\n'), [displayed]);
  const isTyping = displayed.length < text.length;

  return (
    <div className="font-mono text-[15px] leading-[2] tracking-wide">
      {lines.map((line, i) => (
        <div key={i} className="min-h-[1.8em]">
          {line}
          {i === lines.length - 1 && isTyping && (
            <span className="inline-block w-[2px] h-[1.1em] bg-ink ml-[1px] align-text-bottom animate-blink" />
          )}
        </div>
      ))}
      {!isTyping && text.length > 0 && (
        <span className="inline-block w-[2px] h-[1.1em] bg-ink/40 ml-[1px] align-text-bottom animate-blink" />
      )}
    </div>
  );
};

// --- Audio Player ---
const AudioPlayer = ({ url }: { url: string }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('timeupdate', () => {
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    });
    audio.addEventListener('ended', () => {
      setPlaying(false);
      setProgress(0);
    });
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-4 border border-ink/10 p-4"
    >
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full border border-ink flex items-center justify-center shrink-0 hover:bg-ink hover:text-white transition-colors"
      >
        {playing ? <Pause size={14} strokeWidth={1.5} /> : <Play size={14} strokeWidth={1.5} />}
      </button>
      <div className="flex-1">
        <div className="text-sm opacity-70">Posłuchaj wiersza</div>
        <div className="text-[11px] opacity-30">Czytanie teatralne</div>
        <div className="h-[1px] bg-ink/10 w-full mt-2 relative">
          <div className="absolute h-[1px] bg-ink left-0 top-0 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <span className="font-mono text-[11px] opacity-30 shrink-0">
        {fmt(duration * progress)} / {fmt(duration)}
      </span>
    </motion.div>
  );
};

// --- Main Page ---
export const GeneratePage = () => {
  const {
    state,
    poem,
    audioUrl,
    webSpeech,
    isAudioLoading,
    error,
    isLimitReached,
    generate,
    reset,
  } = usePoetryGenerator();

  const handleGenerate = () => {
    generate('losowy');
  };

  // ---------- IDLE ----------
  if (state === 'idle') {
    return (
      <motion.div
        key="idle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="pt-12"
      >
        <h1 className="text-[32px] font-cormorant font-bold leading-tight">
          Maszyna do wierszy
        </h1>
        <p className="text-sm italic opacity-50 mt-2 font-serif">
          Sztuczna inteligencja pisze w duchu Wojaczka
        </p>

        <div className="w-10 h-[1px] bg-ink/15 my-8" />

        <p className="text-sm leading-relaxed opacity-50 max-w-[55ch]">
          Algorytm wygeneruje oryginalny wiersz inspirowany
          poetyką Rafała Wojaczka — jego rytmem, obrazowaniem, napięciem.
          To nie jest wiersz poety. To echo jego stylu, przetworzone przez maszynę.
        </p>

        {isLimitReached ? (
          <div className="mt-8 p-6 border border-ink/10 text-center">
            <p className="text-sm opacity-60">Wróć jutro po nowe wiersze</p>
            <p className="text-[11px] opacity-30 mt-2">Limit 10 generacji dziennie</p>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className="w-full mt-8 py-4 text-sm font-medium uppercase tracking-widest bg-ink text-white hover:bg-ink/90 transition-all"
          >
            Napisz wiersz
          </button>
        )}
      </motion.div>
    );
  }

  // ---------- GENERATING ----------
  if (state === 'generating') {
    return (
      <motion.div
        key="generating"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="pt-12"
      >
        <p className="text-[11px] uppercase tracking-widest opacity-30 mb-8">
          Maszyna do wierszy
        </p>

        <div className="max-w-[50ch] mx-auto">
          {poem ? (
            <Typewriter text={poem} speed={40} />
          ) : (
            <div className="flex items-center gap-3 opacity-30">
              <div className="font-mono text-sm">
                <span className="animate-blink">|</span>
              </div>
            </div>
          )}
        </div>

        {/* Subtle typing sound indicator */}
        <div className="mt-8 flex items-center gap-2 opacity-20">
          <div className="w-1 h-1 bg-ink rounded-full animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider uppercase">
            maszyna pisze
          </span>
        </div>
      </motion.div>
    );
  }

  // ---------- ERROR ----------
  if (state === 'error') {
    return (
      <motion.div
        key="error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-12 text-center"
      >
        <p className="text-base opacity-50 mb-2">Nie udało się wygenerować wiersza</p>
        <p className="text-sm opacity-30 mb-8">{error || 'Sprawdź połączenie i spróbuj ponownie'}</p>
        <button
          onClick={reset}
          className="py-3 px-8 border border-ink/20 text-sm hover:border-ink transition-colors"
        >
          Spróbuj ponownie
        </button>
      </motion.div>
    );
  }

  // ---------- GENERATED ----------
  return (
    <motion.div
      key="generated"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-12"
    >
      <p className="text-[11px] uppercase tracking-widest opacity-30 mb-8">
        Maszyna do wierszy
      </p>

      <div className="max-w-[50ch] mx-auto">
        <Typewriter text={poem} speed={35} />
      </div>

      <div className="w-10 h-[1px] bg-ink/15 my-8" />

      {/* Audio */}
      {isAudioLoading && (
        <div className="flex items-center gap-3 opacity-30 mb-4">
          <RefreshCw size={14} className="animate-spin" />
          <span className="text-sm">Generuję czytanie...</span>
        </div>
      )}

      {audioUrl && <AudioPlayer url={audioUrl} />}

      {!audioUrl && !isAudioLoading && webSpeech && (
        <button
          onClick={() => webSpeech()}
          className="flex items-center gap-3 py-3 px-4 border border-ink/10 hover:border-ink/30 transition-colors w-full"
        >
          <Volume2 size={16} strokeWidth={1.2} className="opacity-50" />
          <span className="text-sm opacity-70">Przeczytaj głosem</span>
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={reset}
          className="flex-1 py-3 border border-ink/20 text-sm hover:border-ink transition-colors"
        >
          Napisz kolejny
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-center opacity-25 mt-12 max-w-[45ch] mx-auto leading-relaxed">
        Ten wiersz został wygenerowany przez sztuczną inteligencję
        inspirowaną stylistyką Rafała Wojaczka.
        Nie jest to tekst autorstwa poety.
      </p>
    </motion.div>
  );
};
