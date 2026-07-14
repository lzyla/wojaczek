import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_MESSAGES = 40; // 20 exchanges

interface PoetChatProps {
  embedded?: boolean; // true when used as a tab (always open)
}

export const PoetChat = ({ embedded = false }: PoetChatProps) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || messages.length >= MAX_MESSAGES) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';
      let sseBuffer = '';

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split('\n\n');
        sseBuffer = events.pop() || '';

        for (const event of events) {
          for (const line of event.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullText += parsed.delta.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: fullText,
                  };
                  return updated;
                });
              }
            } catch {
              /* incomplete JSON chunk */
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '...' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={embedded ? '' : 'mt-12 border-t border-ink/8 pt-8'}>
      {/* Collapsed bar */}
      {!isOpen && !embedded && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          <div className="px-5 py-3 bg-[#f0f0f0] text-ink border border-ink/10 rounded-xl flex items-center justify-between text-sm">
            <span className="font-cormorant font-bold tracking-tight">
              Porozmawiaj z Rafałem Wojaczkiem
            </span>
            <ChevronUp size={16} />
          </div>
        </button>
      )}

      {/* Expanded chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border border-ink/10 flex flex-col">
              {/* Handle + close */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full pt-3 pb-2 flex flex-col items-center gap-2 border-b border-ink/8"
              >
                <div className="w-10 h-1 bg-ink/15 rounded-full" />
                <div className="flex items-center gap-2">
                  <span className="label-ui text-mist-dark text-[9px]">
                    CIEŃ POETY
                  </span>
                  <ChevronDown size={12} className="text-mist-dark" />
                </div>
              </button>

              {/* Disclaimer */}
              {messages.length === 0 && (
                <div className="px-6 py-4">
                  <p className="text-xs text-mist-dark leading-relaxed">
                    Rozmowa z algorytmem, który przestudiował styl Wojaczka.
                    To nie jest poeta. To echo.
                  </p>
                </div>
              )}

              {/* Messages — Facebook-style bubbles */}
              <div
                className="overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide"
                style={{ maxHeight: '50vh' }}
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 text-[14px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#e4e4e4] text-ink rounded-[18px] rounded-br-[4px]'
                          : 'bg-[#f0f0f0] text-ink rounded-[18px] rounded-bl-[4px]'
                      }`}
                    >
                      {msg.content || (
                        <div className="flex gap-1 py-1 px-1">
                          <span className="w-2 h-2 bg-ink/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-ink/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-ink/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-ink/8">
                {messages.length >= MAX_MESSAGES ? (
                  <p className="text-xs text-mist-dark text-center py-2">
                    Rozmowa zakończona. Odśwież stronę, żeby zacząć nową.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Napisz coś..."
                      className="flex-1 px-4 py-2.5 border border-ink/15 text-sm bg-white focus:outline-none focus:border-ink/40 placeholder:text-mist"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="w-10 h-10 border border-ink/15 flex items-center justify-center hover:bg-ink hover:text-white transition-colors disabled:opacity-30"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}

                {/* Bottom disclaimer */}
                <p className="text-[9px] text-mist text-center mt-2 leading-tight">
                  To nie jest Rafał Wojaczek. To AI inspirowane jego stylem.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
