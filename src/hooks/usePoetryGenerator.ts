import { useState, useCallback } from 'react';
import { generatePoem } from '../lib/generatePoem';
import { generateAudio } from '../lib/textToSpeech';
import type { TopicKey } from '../lib/poetryPrompt';

type GeneratorState = 'idle' | 'generating' | 'generated' | 'error';

const MAX_GENERATIONS = 10;
const STORAGE_KEY = 'wojaczek_gen_count';

function getGenerationCount(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    const { count, date } = JSON.parse(stored);
    // Reset daily
    if (date !== new Date().toDateString()) return 0;
    return count;
  } catch {
    return 0;
  }
}

function incrementGenerationCount(): void {
  const count = getGenerationCount() + 1;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ count, date: new Date().toDateString() })
  );
}

export function usePoetryGenerator() {
  const [state, setState] = useState<GeneratorState>('idle');
  const [poem, setPoem] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [webSpeech, setWebSpeech] = useState<(() => Promise<void>) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(
    () => getGenerationCount() >= MAX_GENERATIONS
  );

  const generate = useCallback(async (topic: TopicKey) => {
    if (getGenerationCount() >= MAX_GENERATIONS) {
      setIsLimitReached(true);
      return;
    }

    setState('generating');
    setPoem('');
    setAudioUrl(null);
    setWebSpeech(null);
    setError(null);

    await generatePoem(
      topic,
      (partialText) => setPoem(partialText),
      async (fullText) => {
        setState('generated');
        incrementGenerationCount();
        setIsLimitReached(getGenerationCount() >= MAX_GENERATIONS);

        setIsAudioLoading(true);
        try {
          const audio = await generateAudio(fullText);
          if (audio.type === 'blob' && audio.url) {
            setAudioUrl(audio.url);
          } else if (audio.speak) {
            setWebSpeech(() => audio.speak!);
          }
        } catch {
          // Audio optional
        } finally {
          setIsAudioLoading(false);
        }
      },
      (errMsg) => {
        setError(errMsg);
        setState('error');
      }
    );
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setState('idle');
    setPoem('');
    setAudioUrl(null);
    setWebSpeech(null);
    setError(null);
  }, [audioUrl]);

  return {
    state,
    poem,
    audioUrl,
    webSpeech,
    isAudioLoading,
    error,
    isLimitReached,
    generate,
    reset,
  };
}
