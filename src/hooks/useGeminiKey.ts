import { useState, useEffect, useCallback } from 'react';

interface AiStudio {
  hasSelectedApiKey(): Promise<boolean>;
  openSelectKey(): Promise<void>;
}

function getAiStudio(): AiStudio | null {
  return (window as any).aistudio ?? null;
}

export function useGeminiKey() {
  const [hasKey, setHasKey] = useState(true);

  useEffect(() => {
    const studio = getAiStudio();
    if (studio) {
      studio.hasSelectedApiKey().then(setHasKey);
    }
  }, []);

  const openKeyDialog = useCallback(async () => {
    const studio = getAiStudio();
    if (studio) {
      await studio.openSelectKey();
      setHasKey(true);
    }
  }, []);

  const checkAndPromptKey = useCallback(async (): Promise<boolean> => {
    const studio = getAiStudio();
    if (studio) {
      const has = await studio.hasSelectedApiKey();
      if (!has || !hasKey) {
        await studio.openSelectKey();
        setHasKey(true);
        return false;
      }
    }
    return true;
  }, [hasKey]);

  const markKeyMissing = useCallback(() => {
    setHasKey(false);
  }, []);

  return { hasKey, openKeyDialog, checkAndPromptKey, markKeyMissing };
}
