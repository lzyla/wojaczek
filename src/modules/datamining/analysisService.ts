import type { PoemAnalysis, CorpusAnalysis } from './types';

const poemCache = new Map<string, PoemAnalysis>();
let corpusCache: CorpusAnalysis | null = null;

export async function loadPoemAnalysis(id: string): Promise<PoemAnalysis> {
  const cached = poemCache.get(id);
  if (cached) return cached;

  const res = await fetch(`/analyses/poems/${id}.json`);
  if (!res.ok) throw new Error(`Failed to load poem analysis for ${id}`);
  const data: PoemAnalysis = await res.json();
  poemCache.set(id, data);
  return data;
}

export async function loadCorpusAnalysis(): Promise<CorpusAnalysis> {
  if (corpusCache) return corpusCache;

  const res = await fetch('/analyses/corpus.json');
  if (!res.ok) throw new Error('Failed to load corpus analysis');
  const data: CorpusAnalysis = await res.json();
  corpusCache = data;
  return data;
}
