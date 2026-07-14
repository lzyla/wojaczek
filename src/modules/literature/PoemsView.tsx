import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ArrowLeft, Layers } from 'lucide-react';
import { useData } from '../../services/data/dataService';
import { INTERPRETATION_POEMS } from '../../lib/interpretationService';
import { InterpretPoemView } from '../interpretations/InterpretPoemView';
import { InterpretDetailView } from '../interpretations/InterpretDetailView';
import type { Poem, InterpretationPoem } from '../../types';

const AUDIO_BY_TITLE: Record<string, string> = {
  'Sezon': '/audio/sezon.mp3',
  'Który skrzywdził': '/audio/ktory-skrzywdzil.mp3',
  'Który nie był': '/audio/ktory-nie-byl.mp3',
  'Prośba': '/audio/prosba.mp3',
  'Krzyż': '/audio/krzyz.mp3',
  'Reszta krwi': '/audio/reszta-krwi.mp3',
};

// ── Glossary terms (expandable inline) ──
interface GlossaryTerm {
  term: string;
  definition: string;
  related?: string[]; // links to other terms
}

const GLOSSARY: Record<string, GlossaryTerm> = {
  'anafora': { term: 'Anafora', definition: 'Figura retoryczna polegająca na powtórzeniu tego samego słowa lub frazy na początku kolejnych wersów. W starożytnej retoryce (Kwintylian, „Institutio Oratoria") służyła wzmocnieniu argumentacji. W poezji tworzy rytm litanijny — obsesyjne powtórzenie jako wyraz emocjonalnego natężenia.', related: ['paralelizm', 'litania'] },
  'paralelizm': { term: 'Paralelizm', definition: 'Równoległość syntaktyczna — powtórzenie tej samej struktury zdaniowej w kolejnych wersach. Różni się od anafory tym, że powtarza się schemat, nie konkretne słowo. U Wojaczka paralelizm buduje architekturę wiersza jak rusztowanie — symetryczny, geometryczny.', related: ['anafora'] },
  'bezokolicznik': { term: 'Bezokolicznik (infinitivus)', definition: 'Forma czasownika pozbawiona kategorii osoby, liczby i czasu. Émile Benveniste („Problèmes de linguistique générale", 1966) określił go jako „stopień zero" czasownika. U Wojaczka bezokolicznik jest narzędziem depersonalizacji — „Spać. Pić. Żyć." — czynność oderwana od podmiotu, pozbawiona sprawcy.', related: ['depersonalizacja'] },
  'depersonalizacja': { term: 'Depersonalizacja', definition: 'W psychiatrii — zaburzenie polegające na poczuciu obcości wobec własnego ciała i umysłu. W literaturoznawstwie — zabieg polegający na wymazywaniu „ja" z tekstu. Wojaczek operuje depersonalizacją na poziomie gramatycznym (bezokoliczniki, formy bezosobowe) i tematycznym (podmiot, który „nie jest").', related: ['bezokolicznik'] },
  'negacja': { term: 'Negacja poetycka', definition: 'W filozofii Heideggera „das Nichts nichtet" — nicość nicuje. Negacja w poezji Wojaczka nie jest prostym zaprzeczeniem, lecz ontologicznym gestem — budowaniem świata przez odejmowanie. „Nie ma spać / Nie ma oddychać / Żyć nie ma" — negacja staje się jedynym sposobem istnienia.', related: ['nihilizm'] },
  'nihilizm': { term: 'Nihilizm', definition: 'Filozofia negacji wartości i sensu (Nietzsche, „Wola mocy"). U Wojaczka nihilizm nie jest postawą intelektualną, lecz doświadczeniem cielesnym — poeta nie filozofuje o nicości, lecz ją przeżywa. Ciało jest ostatnim bastionem realności w świecie, z którego wycofał się sens.', related: ['negacja', 'turpizm'] },
  'turpizm': { term: 'Turpizm', definition: 'Nurt w polskiej poezji lat 60. (Grochowiak, Harasymowicz, Wojaczek) polegający na wprowadzaniu do poezji motywów brzydoty, fizjologii, rozkładu. Termin ukuty od łac. „turpis" = brzydki. Wojaczek radykalizuje turpizm — ciało nie jest przedmiotem opisu, lecz narzędziem poznania.', related: ['cielesność'] },
  'cielesność': { term: 'Cielesność (somatyczność)', definition: 'W fenomenologii Merleau-Ponty\'ego („Fenomenologia percepcji", 1945) ciało jest podstawowym sposobem bycia-w-świecie. Wojaczek jest poetą somatycznym — pisze ciałem, o ciele, przez ciało. Ręce, skóra, krew, kości to nie metafory, lecz dosłowny materiał poetycki.', related: ['turpizm'] },
  'oksymoron': { term: 'Oksymoron', definition: 'Zestawienie wyrazów o przeciwstawnym znaczeniu (gr. oxýmōron = ostro-głupie). U Wojaczka oksymorony nie są ozdobnikiem, lecz oddają sprzeczność doświadczenia: „sakralne profanum", „żywy trup", „piękna brzydota". Świat poety jest z natury paradoksalny.', related: ['antyteza'] },
  'antyteza': { term: 'Antyteza', definition: 'Zestawienie przeciwstawnych pojęć w obrębie zdania lub wersu. Wojaczek buduje całe wiersze na antytezach: pozioma/pionowy, góra/dolina, ja/ty, życie/śmierć. Antyteza u niego ma charakter erotyczny — przeciwieństwa przyciągają się fizycznie.', related: ['oksymoron', 'opozycja-binarna'] },
  'opozycja-binarna': { term: 'Opozycja binarna', definition: 'Pojęcie strukturalizmu (Lévi-Strauss, Jakobson) — para przeciwstawnych kategorii organizujących znaczenie: natura/kultura, życie/śmierć, sacrum/profanum. U Wojaczka opozycje nie są stabilne — przechodzą jedna w drugą, zacierają granice.', related: ['antyteza'] },
  'litania': { term: 'Litania (forma litanijna)', definition: 'Gatunek modlitwy oparty na powtórzeniu formuły wezwania i odpowiedzi. W poezji — seria wersów o identycznej strukturze, tworzących efekt monotonnego narastania. Wojaczek sekularyzuje litanię — zamiast do Boga, zwraca się do ciała, do nicości, do siebie.', related: ['anafora'] },
  'metafora': { term: 'Metafora (przenośnia)', definition: 'Lakoff i Johnson („Metafory w naszym życiu", 1980) wykazali, że metafora nie jest figurą stylistyczną, lecz sposobem myślenia. Rozumiemy jedną domenę przez drugą: ŻYCIE TO PODRÓŻ, CZAS TO PIENIĄDZ. U Wojaczka metafory są somatyczne — ciało jest mapą, krew jest kosmosem, rana jest oknem.', related: ['metonimia'] },
  'metonimia': { term: 'Metonimia', definition: 'Zamiana nazwy na podstawie przyległości (nie podobieństwa jak w metaforze). „Krew" zamiast „życie", „ręce" zamiast „działanie". Jakobson przeciwstawił metonimię metaforze jako dwa bieguny języka. U Wojaczka dominuje metonimia — poeta mówi częścią ciała zamiast całością.', related: ['metafora'] },
  'podmiot-liryczny': { term: 'Podmiot liryczny', definition: 'Instancja mówiąca w wierszu — „ja" tekstu. Pojęcie wprowadzone przez Irenę Sławińską i rozwinięte przez Janusza Sławińskiego. Nie jest tożsamy z autorem. U Wojaczka granica między podmiotem a autorem jest celowo zamazana — konfesyjność jest strategią, nie naiwnością.', related: ['konfesyjność'] },
  'konfesyjność': { term: 'Konfesyjność', definition: 'Tradycja poezji wyznaniowej (confessional poetry) — termin M.L. Rosenthala z 1959 r., odniesiony do Lowella, Plath, Sexton. Poeta mówi „ja" i ujawnia intymne doświadczenia. Wojaczek łączy konfesyjność zachodnią z polską tradycją „poety przeklętego" (Stachura, Bursa).', related: ['podmiot-liryczny'] },
  'ironia': { term: 'Ironia', definition: 'W retoryce — mówienie czegoś przeciwnego do zamierzonego znaczenia. U Wojaczka ironia jest autoagresywna — poeta ironizuje z siebie, ze swojego cierpienia, ze swojej roli poety. To ironia romantyczna (Schlegel) — świadomość, że każde wyznanie jest jednocześnie kreacją.', related: ['autoironia'] },
  'przerzutnia': { term: 'Przerzutnia (enjambement)', definition: 'Fr. enjamber = przekroczyć. Sytuacja, gdy zdanie nie kończy się z końcem wersu, lecz przechodzi do następnego. Boileau (XVII w.) uznawał ją za błąd; romantycy — za narzędzie ekspresji. U Wojaczka przerzutnia tworzy napięcie między oddechem a składnią — wers się kończy, ale zdanie nie.', related: [] },
  'sacrum-profanum': { term: 'Sacrum/Profanum', definition: 'Opozycja Mircea Eliadego („Sacrum i profanum", 1957) — dwa modele doświadczania rzeczywistości. Wojaczek oscyluje między nimi: modlitwa przechodzi w bluźnierstwo, Bóg pojawia się w kontekście erotycznym, krzyż jest figurą aktu seksualnego. To nie prowokacja, lecz coincidentia oppositorum.', related: ['opozycja-binarna'] },
};

// ── Inline glossary component ──
const GlossaryLink = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[id];
  if (!entry) return <>{children}</>;

  return (
    <span className="relative inline">
      <button
        onClick={() => setOpen(!open)}
        className="text-[#c23030]/70 hover:text-[#c23030] underline decoration-dotted underline-offset-2 transition-colors cursor-pointer"
      >
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="block mt-2 mb-3 p-4 bg-[#f5f3f0] border-l-2 border-[#c23030]/30 text-[12px] leading-relaxed not-italic text-ink/70"
          >
            <strong className="text-ink/90 block mb-1">{entry.term}</strong>
            {entry.definition}
            {entry.related && entry.related.length > 0 && (
              <span className="block mt-2 text-[11px] opacity-50">
                Zobacz też: {entry.related.map(r => GLOSSARY[r]?.term).filter(Boolean).join(', ')}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

// ── Full academic interpretations with glossary links ──
interface InterpretationData {
  summary: string;
  sections: { title: string; content: React.ReactNode }[];
  bibliography?: string[];
}

const FULL_INTERPRETATIONS: Record<string, InterpretationData> = {
  'Sezon': {
    summary: 'Wiersz-manifest poetyki Wojaczka. Seria anafor buduje świat przez negację — jest poręcz, ale nie ma schodów. Bezokoliczniki końcowe wymazują podmiot. Jedyny ruch należy do drzew.',
    sections: [
      { title: 'Struktura i kompozycja', content: <>
        Wiersz zbudowany jest na <GlossaryLink id="anafora">anaforze</GlossaryLink> „Jest... ale nie ma" — powtórzonej pięciokrotnie. Ta <GlossaryLink id="paralelizm">paralelna</GlossaryLink> struktura tworzy rytm <GlossaryLink id="litania">litanijny</GlossaryLink>, w którym każde „jest" zostaje natychmiast anulowane przez „nie ma". Wojaczek buduje świat i jednocześnie go wymazuje — gest ontologicznej <GlossaryLink id="negacja">negacji</GlossaryLink>.
        <br /><br />
        Trzy końcowe <GlossaryLink id="bezokolicznik">bezokoliczniki</GlossaryLink> — „Nie ma spać / Nie ma oddychać / Żyć nie ma" — to kulminacja <GlossaryLink id="depersonalizacja">depersonalizacji</GlossaryLink>. Forma bezosobowa eliminuje podmiot: kto nie ma spać? Nikt. Kiedy? Zawsze. Bezokolicznik jest tu „stopniem zero" egzystencji.
      </> },
      { title: 'Podmiot liryczny', content: <>
        <GlossaryLink id="podmiot-liryczny">Podmiot</GlossaryLink> pojawia się w trzeciej osobie — „Jest ja / ale mnie nie ma". To paradoks <GlossaryLink id="oksymoron">oksymoroniczny</GlossaryLink>: „ja" istnieje jako kategoria gramatyczna, ale nie jako byt. Wojaczek rozszczepia podmiot na „ja" (słowo) i „mnie" (ciało). Słowo trwa, ciało znika. To <GlossaryLink id="konfesyjność">konfesyjność</GlossaryLink> doprowadzona do granicy — wyznanie nieistnienia.
        <br /><br />
        Fraza „ja kocha mokro" łamie składnię: „ja" + trzecia osoba „kocha". Podmiot mówi o sobie jak o przedmiocie — <GlossaryLink id="depersonalizacja">depersonalizacja</GlossaryLink> na poziomie gramatycznym.
      </> },
      { title: 'Symbolika i obrazowanie', content: <>
        Cztery żywioły organizują wiersz: mokro (woda), ciemno (ziemia/ciemność), drzewa (powietrze/ruch), „czarny kot" (ziemia/fatum). <GlossaryLink id="metafora">Metafora</GlossaryLink> „niepospolite ruszenie drzew" to gra słów — „pospolite ruszenie" to termin historyczny (mobilizacja szlachty), tu ironicznie odwrócony. Drzewa są jedynymi bytami zdolnymi do ruchu, podczas gdy podmiot jest unieruchomiony.
        <br /><br />
        „Rodzą czarnego kota / który przebiega wszystkie drogi" — przesąd o czarnym kocie jako zapowiedzi nieszczęścia staje się kosmiczny: kot przebiega WSZYSTKIE drogi, nie jedną. Fatum jest totalne. To <GlossaryLink id="turpizm">turpistyczny</GlossaryLink> obraz losu — brzydki, prozaiczny, nieodwołalny.
      </> },
      { title: 'Kontekst literacki', content: <>
        Wiersz dialoguje z tradycją <GlossaryLink id="nihilizm">nihilistyczną</GlossaryLink> w poezji polskiej — Różewiczowskim „ocaleniem" przez redukcję formy. Ale tam, gdzie Różewicz redukuje, by ocalić etykę, Wojaczek redukuje, by odsłonić pustkę. Bliższy jest Beckettowi („Czekając na Godota") niż polskim poetom — ta sama logika „nic do zrobienia", ten sam bezokolicznikowy bezruch.
        <br /><br />
        Tytuł „Sezon" nawiązuje do Rimbauda („Sezon w piekle") — ale Wojaczek odwraca gest: u Rimbauda sezon się kończy, u Wojaczka nigdy się nie zaczyna. Jest sezon, ale nie ma czasu.
      </> },
    ],
    bibliography: ['T. Karpowicz, „Poezja niemożliwa", Wrocław 1975', 'K. Karasek, „Który skrzywdził: o poezji Wojaczka", Warszawa 2003', 'J. Marx, „Grupa poetycka Rafała Wojaczka", Pamiętnik Literacki 1972/3'],
  },
  'Który skrzywdził': {
    summary: 'Wiersz o krzywdzie dziecięcej jako traumie nieusuwalnej. Kara dla winowajcy to paradoks — ma stać się ofiarą. Milczenie zabija skuteczniej niż gniew.',
    sections: [
      { title: 'Struktura i retoryka', content: <>
        Wiersz zbudowany jest na serii rozkazów — tryb rozkazujący dominuje: „niech się nie odzywa", „niech siada", „Niech siedzi cicho", „Niech zaciska pięści", „niech milczy". To <GlossaryLink id="anafora">anafora</GlossaryLink> rozkazu, <GlossaryLink id="litania">litania</GlossaryLink> kary. Ale kara jest paradoksalna: winowajca ma powtórzyć doświadczenie ofiary — usiąść w kącie, na podłodze, milczeć. Zemsta przez empatię wymuszoną.
        <br /><br />
        Gradacja od zewnętrzności (siadanie, czekanie) ku wnętrzności (zaciskanie pięści, milczenie) buduje napięcie. Ciało się kurczy — od ruchu do bezruchu, od głosu do milczenia. To <GlossaryLink id="depersonalizacja">depersonalizacja</GlossaryLink> przez unieruchomienie.
      </> },
      { title: 'Trauma i psychoanaliza', content: <>
        Wiersz czytany psychoanalitycznie (Freud, „Poza zasadą przyjemności") opisuje kompulsję powtórzenia — trauma dziecięca domaga się odtworzenia. „Skrzywdzony chłopiec / W kącie pokoju / Na podłodze" to scena pierwotna (Urszene) — obraz tak intensywny, że musi być powtórzony.
        <br /><br />
        „Bo gdyby się odezwał / Umarłby ze wstydu" — wstyd jako afekt śmiertelny. Silvan Tomkins (teoria afektów) uznaje wstyd za „niedokończony zachwyt" — twarz odwracająca się od obiektu pożądania. Tu wstyd jest totalny: nie chodzi o konkretny czyn, lecz o sam fakt istnienia winowajcy.
      </> },
      { title: 'Podmiot i adresat', content: <>
        <GlossaryLink id="podmiot-liryczny">Podmiot</GlossaryLink> nie mówi „ja" — jest sędzią, instancją orzekającą. Adresat to „ten" — zaimek wskazujący, nie osobowy. Winowajca nie ma imienia, nie ma tożsamości — jest funkcją krzywdy, którą wyrządził. To <GlossaryLink id="ironia">ironiczna</GlossaryLink> inwersja: ten, kto skrzywdził, zostaje pozbawiony podmiotowości, dokładnie jak skrzywdzony chłopiec.
      </> },
    ],
    bibliography: ['A. Skrendo, „Poezja Rafała Wojaczka", Szczecin 1998', 'S. Freud, „Poza zasadą przyjemności", 1920'],
  },
  'Który nie był': {
    summary: 'Metapoetycki wiersz o pośmiertnym życiu poety w tekście. Paradoksy istnienia/nieistnienia opisują los twórcy, który trwa w oku kamery, ustach aktora, rękach czytelnika.',
    sections: [
      { title: 'Paradoks egzystencjalny', content: <>
        Wiersz operuje serią <GlossaryLink id="oksymoron">oksymoronów</GlossaryLink> egzystencjalnych: „Który nie był / a jednak", „Który umarł / a ciągle się rodzi". To nie gra słów, lecz precyzyjna fenomenologia życia pośmiertnego tekstu. Poeta nie istnieje fizycznie, ale trwa jako efekt lektury — każde czytanie jest narodzinami.
        <br /><br />
        Struktura <GlossaryLink id="paralelizm">paralelna</GlossaryLink> trzech strof tworzy tryptyk: nieistnienie → śmierć → przetrwanie. Każda strofa odwraca oczekiwanie — negacja prowadzi do afirmacji.
      </> },
      { title: 'Media i recepcja', content: <>
        „W oku kamery / w ustach aktora / w rękach czytelnika" — trzy media: film, teatr, książka. Wiersz napisany w 1970 roku antycypuje ekranizację Lecha Majewskiego z 1999 roku. Poeta widzi siebie jako postać, którą inni będą odtwarzać. To <GlossaryLink id="konfesyjność">konfesyjność</GlossaryLink> przewrotna — wyznanie, że „ja" poety jest konstrukcją medialną.
        <br /><br />
        Końcowy wers „był każdym z nas" to gest uniwersalizacji — Wojaczek przestaje być osobą i staje się doświadczeniem. To echo Rimbauda: „JE est un autre" — ja jest kimś innym.
      </> },
    ],
    bibliography: ['R. Barthes, „Śmierć autora", 1967', 'M. Foucault, „Kim jest autor?", 1969'],
  },
  'Prośba': {
    summary: 'Ironiczny katalog społecznych ról poety. Seria bezokoliczników parodiuje użyteczność. Kulminacja obnaża stosunek społeczeństwa do poety jako narzędzia do „użycia".',
    sections: [
      { title: 'Ironia i parodia', content: <>
        Cały wiersz jest aktem <GlossaryLink id="ironia">ironii</GlossaryLink> — poeta „prosi" o to, czego nie chce. Seria <GlossaryLink id="bezokolicznik">bezokoliczników</GlossaryLink> „Dać mi... bym..." parodiuje pragmatyzm: zamiatać plac, kochać kobietę, opiewać ojczyznę. Każda propozycja jest absurdalna w swoim utylitaryzmie — poeta jako zamiatacz, kochanek na zamówienie, dworkowy bard.
        <br /><br />
        Katalog ról społecznych przypomina litanię zawodów — ale żaden nie pasuje. To <GlossaryLink id="turpizm">turpistyczne</GlossaryLink> odwrócenie toposu „poeta wieszcz": zamiast prowadzić naród, poeta ma zamiatać plac.
      </> },
      { title: 'Kulminacja i demaskacja', content: <>
        „A ostatecznie dać mi choć wódki żebym pił / I potem rzygał bo poetów należy używać" — to kulminacja, punkt zwrotny. Słowo „używać" jest kluczowe: poeta jest przedmiotem użycia, nie podmiotem. „Rzygać" to <GlossaryLink id="turpizm">turpistyczny</GlossaryLink> gest — ciało poety buntuje się biologicznie przeciw „użyciu". Rzyganie jest jedyną autentyczną odpowiedzią na instrumentalizację.
        <br /><br />
        Brak interpunkcji w wersach 10-12 tworzy oddech prozaiczny — poeta mówi coraz szybciej, bez pauz, jakby chciał wypowiedzieć wszystko zanim go uciszą.
      </> },
    ],
    bibliography: ['T. Komendant, „Poeta odrzucony", Twórczość 1972/5', 'J. Łukasiewicz, „Poezja Rafała Wojaczka", Odra 1971/9'],
  },
  'Krzyż': {
    summary: 'Wiersz erotyczny zbudowany na opozycjach geometryczno-kosmicznych. Krzyż tytułowy to przecięcie dwóch ciał — sakralne spotkanie zapisane językiem ciała.',
    sections: [
      { title: 'Geometria erotyzmu', content: <>
        Wiersz jest zbudowany na konsekwentnej <GlossaryLink id="antyteza">antytezie</GlossaryLink>: pozioma/pionowy, góra/dolina, Ziemia/Słońce, tarcza/miecz, rana/ból. Każda para to <GlossaryLink id="opozycja-binarna">opozycja binarna</GlossaryLink> zakodowana erotycznie — akt seksualny opisany językiem geometrii i kosmologii. Ciała kochanków tworzą krzyż — figura sakralna staje się figurą seksualną.
        <br /><br />
        <GlossaryLink id="sacrum-profanum">Sacrum i profanum</GlossaryLink> przenikają się: „Ty jesteś Bóg" w kontekście erotycznym to zarówno bluźnierstwo, jak i najwyższy komplement. Mircea Eliade pisał o hierogamii — świętym małżeństwie nieba i ziemi. Wojaczek realizuje hierogamię dosłownie.
      </> },
      { title: 'Zwrot i kulminacja', content: <>
        „Ale nie zawsze" i „Ale do czasu" — dwa wersy łamią symetrię. Kobieta, dotąd „pozioma", staje się „pionowa / Góra orgazmu". Odwrócenie ról jest jednocześnie <GlossaryLink id="metafora">metaforą</GlossaryLink> kulminacji seksualnej i aktem emancypacji — kobieta przejmuje inicjatywę.
        <br /><br />
        Końcowe „Ty jesteś pionowy / Przy mnie" — „przy mnie" to dwuznaczne: fizycznie (obok) i emocjonalnie (w porównaniu ze mną). Mężczyzna jest „pionowy" tylko „przy" kobiecie — jego siła jest relacyjna, nie absolutna. To subtelna <GlossaryLink id="ironia">ironia</GlossaryLink> wobec męskiej dominacji.
      </> },
    ],
    bibliography: ['M. Eliade, „Sacrum i profanum", 1957', 'G. Bataille, „Erotyzm", 1957', 'J. Kornhauser, „Erotyzm i śmierć u Wojaczka", Teksty Drugie 1993/4'],
  },
  'Reszta krwi': {
    summary: 'Intymny wiersz kosmiczny. Ziemia widziana z kosmosu leży „na dnie łzy". Krew i glob przenikają się — ciało staje się kosmosem, kosmos staje się ciałem.',
    sections: [
      { title: 'Skala kosmiczna i intymna', content: <>
        „Widzisz / to jest Ziemia / Wygląda jak gwiazda" — poeta pokazuje planetę z perspektywy kosmonauty. Ale natychmiast skala się załamuje: gwiazda leży „na dnie / łzy". <GlossaryLink id="metafora">Metafora</GlossaryLink> jest podwójna: łza jako kosmos (gwiazda na dnie łzy) i kosmos jako łza (Ziemia tak mała, że mieści się w kropli). To <GlossaryLink id="oksymoron">oksymoroniczne</GlossaryLink> napięcie między wielkością a intymnością.
        <br /><br />
        <GlossaryLink id="przerzutnia">Przerzutnia</GlossaryLink> po „dnie" jest dramaturgicznie precyzyjna: czytelnik spodziewa się „na dnie oceanu" lub „na dnie studni", a dostaje „łzy" — intymność zamiast geografii.
      </> },
      { title: 'Ciało i kosmos', content: <>
        „To reszta naszej krwi / glob / prześwieca" — Ziemia to skrzep krwi świecący w ciemności. <GlossaryLink id="cielesność">Somatyczna</GlossaryLink> <GlossaryLink id="metafora">metafora</GlossaryLink> kosmologiczna: planeta jako ciało, krew jako materia kosmosu. To odwrócenie tradycji — nie „człowiek jest mikrokosmosem", lecz „kosmos jest makrociałem".
        <br /><br />
        „Boża krówka" — zdrobnienie, dziecięcy obraz wpleciony w metafizykę. Wojaczek nie boi się infantylności — biedronka (boża krówka) świecąca jak gwiazda to obraz czuły i absurdalny jednocześnie. <GlossaryLink id="turpizm">Turpizm</GlossaryLink> na opak — nie brzydota w pięknie, lecz dziecięcość w kosmosie.
      </> },
    ],
    bibliography: ['G. Bachelard, „Poetyka marzenia", 1960', 'M. Stala, „Przeszukiwanie ciemności: o poezji Wojaczka", Znak 1993/7'],
  },
};

// ── Per-line annotations: line index → annotation ──
const LINE_ANNOTATIONS: Record<string, Record<number, { title: string; content: React.ReactNode }>> = {
  'Sezon': {
    0: { title: 'Anafora', content: <><GlossaryLink id="anafora">Anafora</GlossaryLink> „Jest" otwiera wiersz i powraca pięciokrotnie. Poręcz bez schodów — przedmiot pozbawiony funkcji. Metonimia świata, w którym formy istnieją, ale treść wyparowała.</> },
    2: { title: 'Paradoks ontologiczny', content: <>„Jest ja / ale mnie nie ma" — podmiot rozszczepia się na „ja" (kategoria gramatyczna) i „mnie" (<GlossaryLink id="cielesność">ciało</GlossaryLink>). Słowo trwa, ciało znika. <GlossaryLink id="depersonalizacja">Depersonalizacja</GlossaryLink> doprowadzona do paradoksu.</> },
    7: { title: 'Zmiana rejestru', content: <>„Od czasu kiedy jest mokro" — przejście od abstrakcji do zmysłowości. Mokro = woda, łzy, deszcz, alkohol. Wieloznaczność sensoryczna typowa dla <GlossaryLink id="turpizm">turpizmu</GlossaryLink>.</> },
    9: { title: 'Złamanie składni', content: <>„ja kocha mokro" — celowy błąd gramatyczny. „Ja" + trzecia osoba. Podmiot mówi o sobie jak o przedmiocie — <GlossaryLink id="depersonalizacja">depersonalizacja</GlossaryLink> na poziomie gramatyki.</> },
    14: { title: 'Bezokoliczniki', content: <>Trzy <GlossaryLink id="bezokolicznik">bezokoliczniki</GlossaryLink> — „Nie ma spać / Nie ma oddychać / Żyć nie ma" — to kulminacja wymazywania podmiotu. Forma bez osoby, bez czasu. Kto nie ma żyć? Nikt. Kiedy? Zawsze. Benveniste: „stopień zero" czasownika.</> },
    17: { title: 'Ironia językowa', content: <>„Niepospolite ruszenie drzew" — gra słów. „Pospolite ruszenie" to termin historyczny (mobilizacja szlachty). Tu <GlossaryLink id="ironia">ironicznie</GlossaryLink> odwrócony — jedynym ruchem w martwym świecie jest ruch drzew.</> },
    19: { title: 'Symbolika finału', content: <>Czarny kot przebiegający „wszystkie drogi" — przesąd podniesiony do rangi kosmicznej. Fatum jest totalne. <GlossaryLink id="metafora">Metafora</GlossaryLink> losu: nie jedna droga zablokowana, lecz wszystkie.</> },
  },
  'Który skrzywdził': {
    0: { title: 'Apostrofa', content: <>Wiersz otwiera apostrofa — zwrot do adresata. „Który skrzywdził" = zaimek wskazujący, nie osobowy. Winowajca nie ma imienia — jest funkcją krzywdy.</> },
    1: { title: 'Seria rozkazów', content: <>Tryb rozkazujący dominuje: „niech się nie odzywa", „niech siada". To <GlossaryLink id="anafora">anafora</GlossaryLink> rozkazu — kara narzucona przez powtórzenie.</> },
    5: { title: 'Odwrócenie ról', content: <>„Jak skrzywdzony chłopiec / W kącie pokoju / Na podłodze" — kara paradoksalna: winowajca ma powtórzyć doświadczenie ofiary. Zemsta przez wymuszoną <GlossaryLink id="metafora">empatię</GlossaryLink>.</> },
    8: { title: 'Ciało jako więzienie', content: <>„Niech zaciska pięści" — ciało się zamyka, kurczy. Gradacja: od ruchu (siadanie) do bezruchu (milczenie). <GlossaryLink id="cielesność">Somatyczna</GlossaryLink> redukcja.</> },
    10: { title: 'Wstyd jako śmierć', content: <>„Bo gdyby się odezwał / Umarłby ze wstydu" — wstyd zabija skuteczniej niż gniew. Silvan Tomkins: wstyd to „niedokończony zachwyt" — twarz odwracająca się od obiektu.</> },
  },
  'Który nie był': {
    0: { title: 'Paradoks', content: <><GlossaryLink id="oksymoron">Oksymoron</GlossaryLink> egzystencjalny: „Który nie był / a jednak". Poeta nie istnieje, ale „jest" — jako tekst, jako doświadczenie lektury.</> },
    4: { title: 'Śmierć jako narodziny', content: <>„Który umarł / a ciągle się rodzi" — każde czytanie wiersza to narodziny poety. Roland Barthes: „<GlossaryLink id="konfesyjność">śmierć autora</GlossaryLink>" jest warunkiem narodzin czytelnika.</> },
    6: { title: 'Trzy media', content: <>„W oku kamery / w ustach aktora / w rękach czytelnika" — film, teatr, literatura. Poeta antycypuje ekranizację Majewskiego (1999). Życie pośmiertne jest medialne.</> },
    9: { title: 'Uniwersalizacja', content: <>„Był każdym z nas" — Wojaczek przestaje być osobą, staje się doświadczeniem. Echo Rimbauda: „JE est un autre" — ja jest kimś innym. Gest <GlossaryLink id="podmiot-liryczny">transpersonalny</GlossaryLink>.</> },
  },
  'Prośba': {
    0: { title: 'Ironia katalogowa', content: <>Seria <GlossaryLink id="bezokolicznik">bezokoliczników</GlossaryLink> „Dać mi... bym..." to <GlossaryLink id="ironia">ironiczny</GlossaryLink> katalog ról społecznych. Poeta „prosi" o to, czego nie chce — zamiatać, kochać na zamówienie, opiewać.</> },
    3: { title: 'Parodia wieszcza', content: <>„Pejzaż lub ustrój lżył czy chwalił rząd" — <GlossaryLink id="turpizm">turpistyczne</GlossaryLink> odwrócenie toposu poety-wieszcza. Zamiast prowadzić naród, poeta ma chwalić rząd.</> },
    7: { title: 'Seria instytucji', content: <>Szpital, cmentarz, teatr, igrzyska, wojna, żniwa, festyn — instytucje społeczne jako alternatywy dla poezji. Każda jest absurdalna jako „zastępstwo".</> },
    12: { title: 'Kulminacja — demaskacja', content: <>„Dać mi choć wódki żebym pił / I potem rzygał bo poetów należy używać" — słowo „używać" jest kluczowe. Poeta = przedmiot użycia. Rzyganie to <GlossaryLink id="turpizm">turpistyczny</GlossaryLink> bunt ciała przeciw instrumentalizacji.</> },
  },
  'Krzyż': {
    0: { title: 'Geometria ciał', content: <><GlossaryLink id="antyteza">Antyteza</GlossaryLink> pozioma/pionowy otwiera serię <GlossaryLink id="opozycja-binarna">opozycji binarnych</GlossaryLink>. Ciała kochanków tworzą krzyż — figura <GlossaryLink id="sacrum-profanum">sakralno-erotyczna</GlossaryLink>.</> },
    8: { title: 'Ciało jako broń', content: <>„Tarcza / miecz / rana / ból" — erotyzm zakodowany w języku militarnym. Akt seksualny jako bitwa, ciała jako broń i cel. Georges Bataille: erotyzm jest „akceptacją życia aż po śmierć".</> },
    11: { title: 'Teologia ciała', content: <>„Ty jesteś Bóg" w kontekście erotycznym — <GlossaryLink id="sacrum-profanum">sacrum i profanum</GlossaryLink> przenikają się. Hierogamia (Eliade) — święte małżeństwo nieba i ziemi zrealizowane cieleśnie.</> },
    16: { title: 'Zwrot — emancypacja', content: <>„Ale nie zawsze" / „Ale do czasu" — dwa wersy łamią symetrię. Kobieta przejmuje inicjatywę: „Ja jestem pionowa / Góra orgazmu". <GlossaryLink id="ironia">Ironiczna</GlossaryLink> dekonstrukcja męskiej dominacji.</> },
  },
  'Reszta krwi': {
    0: { title: 'Deiktyczny imperatyw', content: <>„Widzisz" — <GlossaryLink id="podmiot-liryczny">podmiot</GlossaryLink> wskazuje, zmusza do patrzenia. Słowo ustanawia relację ja-ty i kwestionuje ją jednocześnie. Forma rozkazu zamaskowana jako stwierdzenie.</> },
    2: { title: 'Podwójna skala', content: <>„Wygląda jak gwiazda / na dnie / łzy" — <GlossaryLink id="przerzutnia">przerzutnia</GlossaryLink> po „dnie" jest dramaturgicznie precyzyjna. Czytelnik oczekuje „na dnie oceanu", dostaje „łzy". Kosmos = łza. <GlossaryLink id="metafora">Metafora</GlossaryLink> podwójna.</> },
    5: { title: 'Zwrot intymny', content: <>„Moja kochana" — nagle kosmiczna perspektywa staje się intymna. Podmiot mówi do konkretnej osoby. To nie wykład, to wyznanie. <GlossaryLink id="konfesyjność">Konfesyjność</GlossaryLink> kosmiczna.</> },
    7: { title: 'Dziecięcość', content: <>„Boża krówka" — zdrobnienie, obraz z dzieciństwa wpleciony w metafizykę. Wojaczek nie boi się infantylności. Biedronka świecąca jak gwiazda — obraz czuły i absurdalny. <GlossaryLink id="turpizm">Turpizm</GlossaryLink> na opak.</> },
    9: { title: 'Ciało jako kosmos', content: <>„Reszta naszej krwi / glob / prześwieca" — Ziemia to skrzep krwi świecący w ciemności. <GlossaryLink id="cielesność">Somatyczna</GlossaryLink> kosmologia: krew = materia kosmosu, ciało = planeta. Nie „mikrokosmos", lecz „makrociało".</> },
  },
};

// ── Single poem detail view ──
const PoemDetail = ({
  poem,
  onBack,
}: {
  poem: Poem;
  onBack: () => void;
}) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showInterp, setShowInterp] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrc = AUDIO_BY_TITLE[poem.title];
  const interp = FULL_INTERPRETATIONS[poem.title];

  const togglePlay = () => {
    if (!audioSrc) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.addEventListener('timeupdate', () => {
        const a = audioRef.current!;
        setProgress(a.duration ? a.currentTime / a.duration : 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setPlaying(false);
        setProgress(0);
      });
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <motion.div
      key="poem-detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="py-12"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span className="text-[12px] tracking-wide">Wiersze</span>
        </button>

        <div className="flex items-center gap-3">
          {interp && (
            <button
              onClick={() => setShowInterp(!showInterp)}
              className={`flex items-center gap-1.5 py-1.5 px-3 border transition-all group ${
                showInterp ? 'border-ink/30 bg-ink/5' : 'border-ink/10 hover:border-ink/30'
              }`}
            >
              <Layers size={12} strokeWidth={1.3} className={showInterp ? 'opacity-60' : 'opacity-30 group-hover:opacity-60'} />
              <span className={`text-[11px] tracking-wide ${showInterp ? 'opacity-70' : 'opacity-40 group-hover:opacity-70'}`}>
                Interpretacje
              </span>
            </button>
          )}
          {audioSrc && (
            <button
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                playing
                  ? 'bg-seal text-white'
                  : 'border border-ink/20 hover:bg-ink hover:text-white'
              }`}
            >
              {playing ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Audio progress bar */}
      {audioSrc && progress > 0 && (
        <div className="h-[1px] bg-ink/10 w-full mb-8 -mt-4">
          <div className="h-full bg-seal transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {/* Title */}
      <h2 className="text-3xl font-cormorant font-bold tracking-tight">{poem.title}</h2>
      <span className="text-[12px] font-mono opacity-30 mt-2 block">{poem.year}</span>

      <div className="w-10 h-[1px] bg-ink/15 my-8" />

      {/* Poem content — with inline annotations when interpretation is on */}
      <div className="text-base leading-[2] font-cormorant italic opacity-80">
        {poem.content.split('\n').map((line, i) => {
          const annotation = showInterp && interp
            ? interp.sections.flatMap(s => {
                // Find annotations that reference this line
                const lineAnnotations: { title: string; content: React.ReactNode }[] = [];
                // Map line index to annotation
                const lineMap = LINE_ANNOTATIONS[poem.title];
                if (lineMap && lineMap[i]) {
                  lineAnnotations.push(lineMap[i]);
                }
                return lineAnnotations;
              })
            : [];

          return (
            <span key={i}>
              <span className="block">{line}</span>
              {annotation.length > 0 && annotation.map((ann, j) => (
                <motion.span
                  key={j}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="block my-4 ml-0 pl-4 border-l-2 border-[#c23030]/20 not-italic"
                >
                  <span className="block text-[11px] uppercase tracking-[0.1em] text-[#c23030]/50 font-dm font-medium mb-1">{ann.title}</span>
                  <span className="block text-[13px] leading-[1.7] text-ink/60 font-dm">{ann.content}</span>
                </motion.span>
              ))}
            </span>
          );
        })}
      </div>

      {/* Sections below poem when interpretation is on */}
      <AnimatePresence>
        {showInterp && interp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mt-10 pt-8 border-t border-ink/10">
              <p className="text-sm leading-relaxed opacity-50 italic mb-8">{interp.summary}</p>
              {interp.sections.map((section, i) => (
                <div key={i} className="mb-8">
                  <h4 className="label-ui text-[#c23030]/60 mb-3">{section.title}</h4>
                  <div className="text-sm leading-[1.8] opacity-70">{section.content}</div>
                </div>
              ))}
              {interp.bibliography && (
                <div className="mt-8 pt-6 border-t border-ink/8">
                  <span className="label-ui text-ink/20 block mb-3">Bibliografia</span>
                  <ul className="space-y-1">
                    {interp.bibliography.map((ref, i) => (
                      <li key={i} className="text-[11px] opacity-30 font-mono">{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main poems list ──
export const PoemsView = ({ initialPoemId }: { initialPoemId?: string } = {}) => {
  const { poems } = useData();
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(() => {
    if (initialPoemId) {
      return poems.find(p => p.id === initialPoemId) || null;
    }
    return null;
  });
  const [selectedInterpretation, setSelectedInterpretation] = useState<InterpretationPoem | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);

  // Interpretation detail
  if (detailNodeId && selectedInterpretation) {
    return (
      <InterpretDetailView
        poem={selectedInterpretation}
        nodeId={detailNodeId}
        onBack={() => setDetailNodeId(null)}
        onNavigateNode={(nodeId) => setDetailNodeId(nodeId)}
      />
    );
  }

  // Interpretation poem view
  if (selectedInterpretation) {
    return (
      <InterpretPoemView
        poem={selectedInterpretation}
        onBack={() => setSelectedInterpretation(null)}
        onNodeClick={(nodeId) => setDetailNodeId(nodeId)}
      />
    );
  }

  // Single poem view
  if (selectedPoem) {
    return (
      <PoemDetail
        poem={selectedPoem}
        onBack={() => setSelectedPoem(null)}
      />
    );
  }

  // Poems list
  return (
    <motion.div
      key="poems-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12 space-y-10"
    >
      <div className="space-y-4">
        <span className="label-ui text-seal">POEZJA</span>
        <h2 className="text-4xl font-cormorant font-bold tracking-tighter mt-3">Wiersze</h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="h-px bg-mist-light origin-left mt-4"
        />
      </div>

      <div className="space-y-0">
        {poems.map((poem, i) => {
          const hasInterp = INTERPRETATION_POEMS.some(
            ip => ip.title.toLowerCase() === poem.title.toLowerCase()
          );
          return (
            <motion.button
              key={poem.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedPoem(poem)}
              className="w-full text-left py-5 border-b border-ink/8 last:border-0 group flex items-baseline justify-between gap-4"
            >
              <div className="flex items-baseline gap-3">
                <h3 className="text-xl font-cormorant font-bold tracking-tight group-hover:text-seal transition-colors">
                  {poem.title}
                </h3>
                {hasInterp && (
                  <Layers size={11} strokeWidth={1.3} className="opacity-15 shrink-0 relative top-[1px]" />
                )}
              </div>
              <span className="text-[11px] font-mono opacity-25 shrink-0">{poem.year}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Interpretation-only poems */}
      {INTERPRETATION_POEMS.filter(
        ip => !poems.some(p => p.title.toLowerCase() === ip.title.toLowerCase())
      ).length > 0 && (
        <>
          <div className="w-10 h-[1px] bg-ink/15" />
          <div className="space-y-0">
            <span className="text-[11px] uppercase tracking-[0.15em] opacity-20 font-mono block mb-4">
              Z interpretacjami
            </span>
            {INTERPRETATION_POEMS.filter(
              ip => !poems.some(p => p.title.toLowerCase() === ip.title.toLowerCase())
            ).map((poem, i) => (
              <motion.button
                key={poem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedInterpretation(poem)}
                className="w-full text-left py-5 border-b border-ink/8 last:border-0 group flex items-baseline justify-between gap-4"
              >
                <div className="flex items-baseline gap-3">
                  <h3 className="text-xl font-cormorant font-bold tracking-tight group-hover:text-seal transition-colors">
                    {poem.title}
                  </h3>
                  <Layers size={11} strokeWidth={1.3} className="opacity-15 shrink-0 relative top-[1px]" />
                </div>
                <span className="text-[11px] font-mono opacity-25 shrink-0">{poem.year}</span>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};
