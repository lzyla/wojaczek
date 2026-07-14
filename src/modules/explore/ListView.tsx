import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { Point, ViewId } from '../../types';

interface ListViewProps {
  onSelectPoint: (point: Point) => void;
  onShowMockups: () => void;
  onNavigate: (view: ViewId) => void;
}

export const ListView = ({ onSelectPoint, onShowMockups, onNavigate }: ListViewProps) => {
  const imgRef = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLDivElement>(null);
  const img3Ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const { scrollYProgress: sp2 } = useScroll({ target: img2Ref, offset: ['start end', 'end start'] });
  const img2Y = useTransform(sp2, [0, 1], ['-6%', '6%']);

  const { scrollYProgress: sp3 } = useScroll({ target: img3Ref, offset: ['start end', 'end start'] });
  const img3Y = useTransform(sp3, [0, 1], ['-6%', '6%']);

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-0"
    >
      <div className="mb-8 mt-8">
        <h1 className="text-6xl font-cormorant font-bold tracking-tighter leading-none mb-6">Nie było</h1>

        {/* Glassmorphism tabs */}
        <div
          className="flex gap-0 rounded-lg overflow-hidden shadow-sm"
          style={{ background: 'rgba(232, 230, 227, 0.4)', backdropFilter: 'blur(12px)' }}
        >
          <button className="flex-1 py-3 label-ui text-[9px] transition-all bg-ink/90 text-white backdrop-blur-sm rounded-l-lg">
            Opis
          </button>
          <button
            onClick={() => onNavigate('trail')}
            className="flex-1 py-3 label-ui text-[9px] transition-all text-ink/60 hover:text-ink hover:bg-white/60 backdrop-blur-sm rounded-r-lg"
          >
            Ścieżka
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Hero image */}
        <div ref={imgRef} className="rounded-xl overflow-hidden shadow-sm">
          <motion.img
            src="/images/deptak-kamienice.jpg"
            alt="Mikołów — deptak"
            className="w-full aspect-[4/3] object-cover grayscale contrast-125 brightness-75 scale-110"
            style={{ y: imgY }}
          />
        </div>

        <p className="text-literary text-sm leading-relaxed">
          „Nie ma mnie, ale jestem tu wszędzie. W każdym pęknięciu muru, w każdym oddechu tego miasta." Śladami Rafała Wojaczka przez Mikołów — miasto, które ukształtowało poetę i które poeta naznaczył swoimi słowami na zawsze.
        </p>

        <p className="text-sm leading-relaxed opacity-60">
          Interaktywna ścieżka po miejscach związanych z życiem i twórczością jednego z najważniejszych polskich poetów XX wieku. Każde miejsce to osobna historia, dźwięk, obraz i słowo.
        </p>

        {/* Photo 2 */}
        <div ref={img2Ref} className="rounded-xl overflow-hidden shadow-sm">
          <motion.img
            src="/images/rynek-panorama.jpg"
            alt="Rynek w Mikołowie"
            className="w-full aspect-[3/2] object-cover grayscale contrast-125 brightness-80 scale-110"
            style={{ y: img2Y }}
          />
        </div>

        <p className="text-literary text-sm leading-relaxed">
          Mikołów to miasto, w którym czas zostawił ślady na każdej kamienicy. Wąskie uliczki prowadzą od Rynku ku peryferiom, gdzie cisza miesza się z echem kroków poety. Wojaczek chodził tędy nocami — między knajpą a domem, między słowem a milczeniem. Każdy bruk pamięta ciężar jego kroków.
        </p>

        <p className="text-sm leading-relaxed opacity-60">
          Górnośląska prowincja lat sześćdziesiątych — dym z kominów, zapach węgla, szarość betonu. Dla Wojaczka to nie było tło. To był materiał poetycki. Z szarości wydobywał obrazy tak intensywne, że bolały. Z codzienności — metafory, które przeżyły poetę o pół wieku.
        </p>

        {/* Photo 3 */}
        <div ref={img3Ref} className="rounded-xl overflow-hidden shadow-sm">
          <motion.img
            src="/images/wojaczek-portret.jpg"
            alt="Rafał Wojaczek — portret"
            className="w-full aspect-[3/4] object-cover object-top grayscale contrast-125 brightness-90 scale-110"
            style={{ y: img3Y }}
          />
        </div>

        <p className="text-literary text-sm leading-relaxed">
          Rafał Wojaczek — poeta, który żył dwadzieścia pięć lat i zdążył napisać więcej prawdy niż inni przez całe życie. Urodził się w Mikołowie 6 grudnia 1945 roku. Zmarł we Wrocławiu 11 maja 1971 roku. Między tymi datami zmieścił się świat — brutalny, czuły, bezkompromisowy.
        </p>

        <p className="text-sm leading-relaxed opacity-60">
          Jego wiersze to zapis ciała i duszy w stanie permanentnego konfliktu. Pisał o miłości, która rani. O śmierci, która jest sąsiadką. O ciele, które jest jedyną mapą, jakiej potrzebujemy. Nie szukał piękna — szukał prawdy. I znajdował ją tam, gdzie inni odwracali wzrok.
        </p>

        {/* Photo 4 */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="/images/park-planty.jpg"
            alt="Park Planty w Mikołowie"
            className="w-full aspect-[4/3] object-cover grayscale contrast-110 brightness-85"
          />
        </div>

        <p className="text-literary text-sm leading-relaxed">
          Park Planty — zielona oaza w centrum Mikołowa. Tu młody Wojaczek szukał samotności wśród starych drzew. Ławki pamiętające lata sześćdziesiąte, alejki prowadzące donikąd, cień rzucany przez korony lip. Poeta przychodził tu pisać — albo nie pisać. Czasem ważniejsze było milczenie.
        </p>

        {/* Photo 5 */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="/images/tablica-pamiatkowa.jpg"
            alt="Tablica pamiątkowa"
            className="w-full aspect-[4/3] object-cover grayscale contrast-125 brightness-90"
          />
        </div>

        <p className="text-sm leading-relaxed opacity-60">
          Na fasadzie kamienicy przy ulicy Jana Pawła II wisi tablica pamiątkowa. „Z tego domu wyszedł w świat" — głosi napis. Ale Wojaczek nigdy tak naprawdę nie wyszedł z Mikołowa. Miasto zostało w nim — w każdym wierszu, w każdym obrazie, w każdym krzyku zapisanym na papierze.
        </p>

        {/* Photo 6 */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="/images/ratusz-noca.jpg"
            alt="Ratusz nocą"
            className="w-full aspect-[4/3] object-cover grayscale contrast-110 brightness-75"
          />
        </div>

        <p className="text-literary text-sm leading-relaxed">
          Mikołów nocą należy do Wojaczka. Kiedy gasną latarnie na Rynku i zamykają się ostatnie okna kamienic, miasto staje się sceną jego wierszy. Ratusz rzuca cień na bruk. Cisza jest tak gęsta, że słychać w niej echo dawnych kroków — poety wracającego z knajpy, szepczącego do siebie wersy, które rano zapiszą się w wieczność.
        </p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="h-px bg-mist-light origin-left"
        />

        <p className="text-center text-[11px] opacity-30 font-mono tracking-wider pb-4">
          MIKOŁÓW · SZLAK LITERACKI · 7 MIEJSC
        </p>
      </div>
    </motion.div>
  );
};
