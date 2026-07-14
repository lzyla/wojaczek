import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TIMELINE_EVENTS } from './biographyData';

export const TimelineMode = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) =>
    setExpanded((prev) => (prev === key ? null : key));

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-ink/12" />

      <div className="space-y-0">
        {TIMELINE_EVENTS.map((event, i) => {
          const key = `${event.year}-${i}`;
          const isExpanded = expanded === key;

          // Dot styling by type
          const dotClass =
            event.type === 'poetry'
              ? 'bg-seal border-seal text-white'
              : event.type === 'death'
                ? 'bg-white border-ink/40 text-ink'
                : 'bg-white border-ink/15 text-ink';

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              className="relative pb-8 last:pb-0"
            >
              {/* Dot */}
              <div className="absolute -left-8 top-1">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 + i * 0.04,
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                  }}
                  className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center ${dotClass}`}
                >
                  {event.type === 'death' && (
                    <span className="text-[10px] font-bold leading-none">✕</span>
                  )}
                </motion.div>
              </div>

              {/* Content */}
              <button
                onClick={() => toggle(key)}
                className="w-full text-left group"
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={`label-ui text-[10px] shrink-0 ${
                      event.type === 'poetry' ? 'text-seal' : 'text-mist-dark'
                    }`}
                  >
                    {event.year}
                  </span>
                  <span className="text-sm font-medium text-ink group-hover:text-seal transition-colors">
                    {event.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-mist-dark">{event.summary}</span>
                  {isExpanded ? (
                    <ChevronUp size={12} className="text-mist-dark shrink-0" />
                  ) : (
                    <ChevronDown size={12} className="text-mist-dark shrink-0" />
                  )}
                </div>
              </button>

              {/* Expandable detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 border border-ink/8 bg-mist-light/20">
                      <p className="text-[13px] leading-relaxed text-ink/75">
                        {event.detail}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
