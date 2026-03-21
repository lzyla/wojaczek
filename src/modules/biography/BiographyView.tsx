import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const TIMELINE = [
  { year: '1945', event: 'Urodziny w Mikołowie', detail: '6 grudnia' },
  { year: '1963', event: 'Debiut w „Poezji"', detail: 'Pierwsze publikacje' },
  { year: '1965', event: 'Studia we Wrocławiu', detail: 'Polonistyka' },
  { year: '1969', event: 'Wydanie tomu „Sezon"', detail: 'Debiut książkowy' },
  { year: '1971', event: 'Śmierć we Wrocławiu', detail: '11 maja' },
];

export const BiographyView = () => {
  const portraitRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <motion.div
      key="biography"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      {/* Portrait - parallax */}
      <div ref={portraitRef} className="rounded-xl overflow-hidden shadow-sm mt-4">
        <motion.img
          src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Rafa%C5%82_Wojaczek.jpg"
          alt="Rafał Wojaczek"
          className="w-full aspect-[3/4] object-cover object-center grayscale contrast-125 brightness-90 scale-115"
          style={{ y: imgY }}
          referrerPolicy="no-referrer"
        />
      </div>

      <div>
        <span className="label-ui text-mist-dark text-[12px]">1945 — 1971</span>
        <h2 className="text-5xl font-cormorant font-bold tracking-tighter leading-none mt-3">
          Rafał<br />Wojaczek
        </h2>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <p className="dropcap">
          Urodzony 6 grudnia 1945 roku w Mikołowie, zmarł tragicznie 11 maja 1971 roku we Wrocławiu. Jeden z najwybitniejszych polskich poetów powojennych, zaliczany do grona „poetów przeklętych".
        </p>
        <p>
          Jego twórczość, nasycona motywami śmierci, bólu, buntu i erotyki, do dziś budzi silne emocje. Wojaczek nie tylko pisał poezję – on nią żył, czyniąc z własnej egzystencji bolesny performance.
        </p>

        {/* Quote */}
        <div className="p-6 border-l-2 border-seal bg-mist-light/30 italic mt-8 rounded-r-lg">
          <p className="text-base leading-relaxed opacity-80">
            „Mówię do ciebie cicho, bo nie mam już sił krzyczeć. Moja krew jest atramentem, którym piszę ten świat od nowa."
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="pt-12 border-t border-mist-light">
        <span className="label-ui text-mist block mb-8">KALENDARIUM</span>
        <div className="space-y-0">
          {TIMELINE.map((item, i) => (
            <div
              key={i}
              className="flex gap-6 items-center py-4 border-b border-mist-light/50 last:border-0 group"
            >
              {/* Year circle - keep animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.04, type: 'spring', stiffness: 400, damping: 15 }}
                className="w-14 h-14 rounded-full border border-ink/10 flex items-center justify-center shrink-0 bg-mist-light/30 group-hover:bg-ink group-hover:text-white group-hover:border-ink transition-all duration-300 shadow-sm"
              >
                <span className="label-ui text-[9px]">{item.year}</span>
              </motion.div>
              <div className="flex-1">
                <span className="text-sm font-medium group-hover:text-seal transition-colors">{item.event}</span>
                <span className="text-xs text-mist-dark block mt-0.5">{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
