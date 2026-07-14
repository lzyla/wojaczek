import { TOPIC_PROMPTS, type TopicKey } from './poetryPrompt';
import { gatherPoemContext, formatContextForPrompt } from './poemContext';

export async function generatePoem(
  topic: TopicKey,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // Gather live context (weather, location, time, philosophy motif)
    let contextBlock = '';
    try {
      const ctx = await gatherPoemContext();
      contextBlock = formatContextForPrompt(ctx);
    } catch {
      // Context is optional — generate without it
    }

    // Build the full user prompt: topic + live context
    const topicPrompt = TOPIC_PROMPTS[topic];
    const fullPrompt = contextBlock
      ? `${topicPrompt}\n\n${contextBlock}`
      : topicPrompt;

    const response = await fetch('/api/generate-poem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: fullPrompt }),
    });

    if (!response.ok) {
      onError('Nie udało się wygenerować wiersza');
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let sseBuffer = '';

    if (!reader) {
      onError('Brak odpowiedzi z serwera');
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines
      const events = sseBuffer.split('\n\n');
      // Keep the last (possibly incomplete) event in buffer
      sseBuffer = events.pop() || '';

      for (const event of events) {
        for (const line of event.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullText += parsed.delta.text;
              onChunk(fullText);
            }
          } catch {
            // Incomplete JSON — will be completed in next chunk
          }
        }
      }
    }

    // Process remaining buffer
    if (sseBuffer.trim()) {
      for (const line of sseBuffer.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(fullText);
          }
        } catch { /* ignore */ }
      }
    }

    onComplete(fullText);
  } catch {
    onError('Błąd połączenia — spróbuj ponownie');
  }
}
