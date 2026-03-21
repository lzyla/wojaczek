import { useState, useCallback } from 'react';
import { aiService } from '../services/ai/aiService';
import type { Point } from '../types';

export function useAiReflection(checkAndPromptKey: () => Promise<boolean>, markKeyMissing: () => void) {
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (point: Point) => {
    const hasKey = await checkAndPromptKey();
    if (!hasKey) return;

    setIsGenerating(true);
    try {
      const [reflection, image] = await Promise.all([
        aiService.generateReflection(point.title),
        aiService.generateImage(point.description)
      ]);
      setAiReflection(reflection);
      setAiImage(image);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("403") || error.message?.includes("permission")) {
        markKeyMissing();
      }
    } finally {
      setIsGenerating(false);
    }
  }, [checkAndPromptKey, markKeyMissing]);

  const reset = useCallback(() => {
    setAiReflection(null);
    setAiImage(null);
  }, []);

  return { aiReflection, aiImage, isGenerating, generate, reset };
}
