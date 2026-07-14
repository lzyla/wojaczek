import { motion } from 'motion/react';
import { ExternalLink, BookOpen, Film, Mic, Globe, ShoppingBag } from 'lucide-react';

interface BookItem {
  title: string;
  year: string;
  publisher?: string;
  description: string;
  buyUrl?: string;
  readUrl?: string;
}

interface ResourceItem {
  title: string;
  description: string;
  url: string;
  icon: typeof BookOpen;
}

const BOOKS: BookItem[] = [
  {
    title: 'Sezon',
    year: '1969',
    publisher: 'Ossolineum',
    description: 'Debiutancki tom wierszy. Sensacja literacka, uznany za jedno z najważniejszych wydarzeń polskiej poezji lat 60.',
    buyUrl: 'https://www.empik.com/szukaj/produkt?q=wojaczek+sezon',
  },
  {
    title: 'Inna bajka',
    year: '1970',
    publisher: 'Ossolineum',
    description: 'Drugi tom poetycki. Pogłębienie turpistycznego i konfesyjnego stylu. Wiersze pisane na granicy języka i milczenia.',
    buyUrl: 'https://www.empik.com/szukaj/produkt?q=wojaczek+inna+bajka',
  },
  {
    title: 'Nie skończona krucjata',
    year: '1972',
    publisher: 'Ossolineum',
    description: 'Tom wydany pośmiertnie. Wiersze z ostatnich miesięcy życia poety — najintensywniejsze i najbardziej osobiste.',
    buyUrl: 'https://www.empik.com/szukaj/produkt?q=wojaczek+krucjata',
  },
  {
    title: 'Wiersze zebrane',
    year: '2005',
    publisher: 'Biuro Literackie',
    description: 'Najpełniejsze wydanie — wszystkie wiersze Wojaczka w jednym tomie. Opracowanie Bogusława Kierca.',
    buyUrl: 'https://www.biuroliterackie.pl/sklep/ksiazki/wiersze-zebrane-2/',
  },
  {
    title: 'Sanatorium',
    year: '1971',
    publisher: 'Ossolineum',
    description: 'Proza poetycka — jedyny utwór prozatorski Wojaczka. Zapis doświadczenia szpitala psychiatrycznego.',
    buyUrl: 'https://www.empik.com/szukaj/produkt?q=wojaczek+sanatorium',
  },
  {
    title: 'Utwory zebrane',
    year: '2006',
    publisher: 'Biuro Literackie',
    description: 'Kompletne wydanie — wiersze, proza, listy, fragmenty. Pod redakcją Bogusława Kierca.',
    buyUrl: 'https://www.biuroliterackie.pl/',
  },
];

const ABOUT_BOOKS: BookItem[] = [
  {
    title: 'Wojaczek. Prawdziwe życie bohatera',
    year: '1999',
    publisher: 'Wydawnictwo Literackie',
    description: 'Biografia autorstwa Macieja Melonika. Rozmowy ze świadkami, dokumenty, fotografie.',
    buyUrl: 'https://www.empik.com/szukaj/produkt?q=wojaczek+prawdziwe+zycie',
  },
  {
    title: 'Który jest. Rafał Wojaczek w oczach przyjaciół',
    year: '2003',
    publisher: 'Biuro Literackie',
    description: 'Wspomnienia i świadectwa osób, które znały poetę. Intymny portret twórcy.',
    buyUrl: 'https://www.empik.com/szukaj/produkt?q=wojaczek+kt%C3%B3ry+jest',
  },
];

const RESOURCES: ResourceItem[] = [
  {
    title: 'Film „Wojaczek" (1999)',
    description: 'Reż. Lech Majewski. Krzysztof Siwczyk w roli poety. Nagroda za reżyserię na FPFF w Gdyni.',
    url: 'https://www.filmweb.pl/film/Wojaczek-1999-761',
    icon: Film,
  },
  {
    title: 'Instytut Mikołowski',
    description: 'Instytucja kultury im. Rafała Wojaczka w Mikołowie. Organizator corocznych Dni Wojaczka.',
    url: 'https://instytumikolowski.pl/',
    icon: Globe,
  },
  {
    title: 'Wojaczek w Poezji Polskiej',
    description: 'Wiersze Wojaczka w serwisie Wolne Lektury — darmowy dostęp do tekstów.',
    url: 'https://wolnelektury.pl/szukaj/?q=wojaczek',
    icon: BookOpen,
  },
  {
    title: 'Literacki wehikuł czasu — Wojaczek',
    description: 'Film dokumentalny przybliżający życie i twórczość poety.',
    url: 'https://www.youtube.com/watch?v=Y-MZW5LopKk',
    icon: Film,
  },
  {
    title: 'Sylwetki Poetów — Wojaczek',
    description: 'Podcast o życiu i twórczości Rafała Wojaczka.',
    url: 'https://www.youtube.com/watch?v=ujjZtBRRh1I',
    icon: Mic,
  },
];

const BookCard = ({ book, index }: { book: BookItem; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="border border-ink/10 p-5"
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-cormorant font-bold text-lg leading-tight">{book.title}</h4>
      <span className="font-mono text-[11px] text-ink/40 shrink-0 ml-3">{book.year}</span>
    </div>
    {book.publisher && (
      <p className="text-[11px] text-ink/40 mb-2">{book.publisher}</p>
    )}
    <p className="text-sm text-ink/70 leading-relaxed mb-3">{book.description}</p>
    <div className="flex gap-2">
      {book.buyUrl && (
        <a
          href={book.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink/60 hover:text-ink transition-colors"
        >
          <ShoppingBag size={12} />
          Kup
          <ExternalLink size={10} />
        </a>
      )}
      {book.readUrl && (
        <a
          href={book.readUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink/60 hover:text-ink transition-colors"
        >
          <BookOpen size={12} />
          Czytaj online
          <ExternalLink size={10} />
        </a>
      )}
    </div>
  </motion.div>
);

const ResourceCard = ({ item, index }: { item: ResourceItem; index: number }) => {
  const Icon = item.icon;
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4 p-4 border border-ink/10 hover:border-ink/25 transition-colors group"
    >
      <div className="w-10 h-10 border border-ink/15 flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-white transition-colors">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm mb-1">{item.title}</h4>
        <p className="text-[12px] text-ink/50 leading-relaxed">{item.description}</p>
      </div>
      <ExternalLink size={14} className="text-ink/30 shrink-0 mt-1" />
    </motion.a>
  );
};

export const BibliotekaMode = () => (
  <div className="space-y-10">
    {/* Books by Wojaczek */}
    <section>
      <h3 className="label-ui text-[10px] tracking-wider text-ink/40 mb-4">KSIĄŻKI WOJACZKA</h3>
      <div className="space-y-3">
        {BOOKS.map((book, i) => (
          <BookCard key={book.title} book={book} index={i} />
        ))}
      </div>
    </section>

    {/* Books about Wojaczek */}
    <section>
      <h3 className="label-ui text-[10px] tracking-wider text-ink/40 mb-4">O WOJACZKU</h3>
      <div className="space-y-3">
        {ABOUT_BOOKS.map((book, i) => (
          <BookCard key={book.title} book={book} index={i} />
        ))}
      </div>
    </section>

    {/* Other resources */}
    <section>
      <h3 className="label-ui text-[10px] tracking-wider text-ink/40 mb-4">MATERIAŁY I ŹRÓDŁA</h3>
      <div className="space-y-3">
        {RESOURCES.map((item, i) => (
          <ResourceCard key={item.title} item={item} index={i} />
        ))}
      </div>
    </section>
  </div>
);
