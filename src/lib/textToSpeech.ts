// ElevenLabs voice: "Chuck Miller" - Deep, Raspy, theatrical
const ELEVENLABS_VOICE_ID = 'HIGUfNOdjuWQwwapnTRW'; // Chuck Miller - deep, raspy

async function generateSpeechElevenLabs(
  text: string,
  apiKey: string
): Promise<string> {
  // Add pauses for theatrical reading of poetry
  // Double newlines = stanza breaks (long pause)
  // Single newlines = verse breaks (medium pause)
  const processedText = text
    .replace(/\n\n+/g, ' ...... ')
    .replace(/\n/g, ' ... ');

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: processedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.20,         // Very low = more expressive, dramatic pauses
          similarity_boost: 0.55,  // Allow voice variation for theatricality
          style: 0.90,             // Maximum theatrical expression
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Błąd generowania audio');
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

function speakText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Brak syntezy mowy'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.65;   // Slower - theatrical recitation
    utterance.pitch = 0.75;  // Lower pitch - older, deeper voice
    utterance.volume = 0.9;

    const voices = speechSynthesis.getVoices();
    const polishVoice = voices.find((v) => v.lang.startsWith('pl'));
    if (polishVoice) utterance.voice = polishVoice;

    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error('Błąd syntezy'));
    speechSynthesis.speak(utterance);
  });
}

export async function generateAudio(text: string): Promise<{
  type: 'blob' | 'webspeech';
  url?: string;
  speak?: () => Promise<void>;
}> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  if (apiKey) {
    try {
      const url = await generateSpeechElevenLabs(text, apiKey);
      return { type: 'blob', url };
    } catch {
      // fallback
    }
  }

  return {
    type: 'webspeech',
    speak: () => speakText(text),
  };
}
