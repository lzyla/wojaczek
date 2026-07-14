import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

const TEAM = [
  { label: 'KONCEPCJA', value: 'Łukasz Żyła', initial: 'K' },
  { label: 'DIGITALIZACJA', value: 'Marcin Bies', initial: 'D' },
  { label: 'DESIGN', value: 'Fundacja Human-tech', initial: 'D' },
  { label: 'TECHNOLOGIE', value: 'Anthropic', initial: 'T' },
  { label: 'AUDIO', value: 'ElevenLabs', initial: 'A' },
  { label: 'ARCHIWUM', value: 'Instytut Mikołowski', initial: 'A' },
];

export const InfoView = () => (
  <motion.div
    key="info"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-12 py-12"
  >
    <div className="space-y-4">
      <span className="label-ui text-seal">INFORMACJE</span>
      <h2 className="text-4xl font-cormorant font-bold tracking-tighter mt-3">O Projekcie</h2>
    </div>

    <p className="text-sm leading-relaxed opacity-70 mt-2">
      „Wojaczek – Mapa Obecności" to interaktywny audio-przewodnik po Mikołowie śladami Rafała Wojaczka. Projekt łączy literaturę, historię lokalną i nowoczesne technologie AI, by stworzyć unikalne doświadczenie artystyczne.
    </p>

    {/* Separator */}
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="h-px bg-mist-light origin-left"
    />

    {/* Team */}
    <div className="space-y-6">
      <span className="label-ui block text-ink/70 text-[10px]">ZESPÓŁ</span>
      <div className="space-y-0">
        {TEAM.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center gap-4 py-4 border-b border-mist-light/50 last:border-0 group"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04, type: 'spring', stiffness: 400, damping: 15 }}
              className="w-10 h-10 rounded-full bg-mist-light/40 flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-all duration-300 shadow-sm"
            >
              <span className="label-ui text-[9px]">{item.initial}</span>
            </motion.div>
            <div>
              <span className="label-ui text-[8px] text-mist-dark">{item.label}</span>
              <p className="text-sm mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Contact */}
    <div className="space-y-6">
      <span className="label-ui block text-ink/70 text-[10px]">KONTAKT</span>
      <div className="p-6 bg-mist-light/25 rounded-xl space-y-4 text-sm">
        <div className="flex items-center gap-3 opacity-70">
          <ExternalLink size={14} className="text-mist shrink-0" />
          <p>Human-tech</p>
        </div>
      </div>
    </div>

    {/* Version */}
    <div className="pt-8 border-t border-mist-light opacity-30">
      <p className="label-ui text-[8px] text-mist-dark leading-relaxed">
        WERSJA 1.0 / MIKOŁÓW 2025<br />
        FUNDACJA HUMAN-TECH
      </p>
    </div>
  </motion.div>
);
