import type { Point, Poem, GalleryImage, TimelineEvent, Letter } from '../types';

export const MAP_CENTER: [number, number] = [50.1690, 18.9040];
export const MAP_ZOOM = 15;
export const MAP_DETAIL_ZOOM = 16;

export const POINTS: Point[] = [
  {
    id: "1",
    title: "Dom Rodzinny",
    category: "BIOGRAFIA",
    lat: 50.1706,
    lng: 18.9054,
    description: "Kamienica przy ul. Jana Pawła II, w której 6 grudnia 1945 roku urodził się Rafał Mikołaj Wojaczek. Na fasadzie budynku znajduje się tablica pamiątkowa.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "/images/dom-rodzinny.jpg",
    duration: "4:20",
    resourceCount: 8,
    arExperience: {
      title: "Nie chcę tu mieszkać",
      hint: "Skieruj aparat na fasadę domu i utrzymaj kadr przez chwilę w centralnym oknie.",
      anchorLabel: "fasadę kamienicy",
      lines: [
        "NIE CHCĘ TU MIESZKAĆ",
        "W TYM DOMU MOICH RODZICÓW",
      ],
      activationRadiusMeters: 80,
      accentColor: "#d44545",
    },
    media: [
      { type: 'text', content: 'Rafał Wojaczek urodził się 6 grudnia 1945 roku w Mikołowie, w kamienicy przy ulicy Jana Pawła II (dawniej ul. 1 Maja). Dom rodzinny stał się pierwszą sceną jego poetyckiego życia. Na fasadzie budynku znajduje się tablica pamiątkowa upamiętniająca poetę — jednego z najważniejszych polskich twórców XX wieku.' },
      { type: 'photo', url: '/images/tablica-pamiatkowa.jpg', caption: 'Tablica pamiątkowa na domu rodzinnym poety' },
      { type: 'gallery', images: [
        { url: '/images/tablica-bliska.jpg', caption: 'Tablica z bliska' },
        { url: '/images/tablica-bok.jpg', caption: 'Tablica — widok z boku' },
        { url: '/images/klatka-schodowa.jpg', caption: 'Klatka schodowa' },
        { url: '/images/klatka-schodowa-2.jpg', caption: 'Klatka schodowa — widok z góry' },
      ]},
      { type: 'text', content: 'Wojaczek dorastał w cieniu górnośląskiej codzienności — między kominami hut a ciszą podmiejskich podwórek. Kamienica, w której się urodził, stała się później symbolem jego poetyckiego początku. Mieszkańcy Mikołowa do dziś wspominają rodzinę Wojaczków.' },
      { type: 'video', url: 'https://www.youtube.com/embed/Y-MZW5LopKk', platform: 'youtube' },
      { type: 'text', content: 'Film dokumentalny przybliża postać poety — jego dzieciństwo w Mikołowie, trudne relacje rodzinne i pierwsze zetknięcie ze słowem pisanym. Wojaczek od najmłodszych lat wyróżniał się wrażliwością, która później przerodziła się w poetycki geniusz.' },
      { type: 'poem', title: 'Który skrzywdził', content: 'Nie chcę tu mieszkać\nw tym domu moich rodziców\ngdzie wszystko jest prawdziwe\ni nic nie jest możliwe', background: '#1a1a1a' },
      { type: 'audio', url: '/audio/miejsce-dom.mp3', title: 'Narracja — Dom Rodzinny Wojaczka' },
      { type: 'audio', url: '/audio/wojaczek-wiersz.mp3', title: 'Wojaczek — czytanie wiersza' },
      { type: 'beforeAfter', before: { url: '/images/dom-rodzinny.jpg', label: 'Archiwalne' }, after: { url: '/images/tablica-pamiatkowa.jpg', label: 'Współcześnie' } },
      { type: 'map', lat: 50.1706, lng: 18.9054, zoom: 18 },
    ]
  },
  {
    id: "2",
    title: "Pomnik Rafała Wojaczka",
    category: "KULTURA",
    lat: 50.1696,
    lng: 18.9049,
    description: "Brązowy pomnik poety autorstwa rzeźbiarza Macieja Paździora, odsłonięty 13 maja 2022 roku w centrum Mikołowa.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    imageUrl: "/images/wojaczek-tablica.jpg",
    duration: "3:15",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Pomnik Rafała Wojaczka autorstwa rzeźbiarza Macieja Paździora został odsłonięty 13 maja 2022 roku w centrum Mikołowa. Brązowa rzeźba przedstawia poetę siedzącego na ławce — w okularach przeciwsłonecznych, z papierosem. Jest najnowszym upamiętnieniem twórcy w jego rodzinnym mieście.' },
      { type: 'photo', url: '/images/wojaczek-portret.jpg', caption: 'Portret Rafała Wojaczka' },
      { type: 'text', content: 'Pomnik przedstawia Wojaczka w charakterystycznej pozie — siedzi na ławce z papierosem, w okularach przeciwsłonecznych. Rzeźbiarz Maciej Paździor oddał zarówno nonszalancję, jak i melancholię poety. Odsłonięcie pomnika było wielkim wydarzeniem kulturalnym Mikołowa.' },
      { type: 'video', url: 'https://www.youtube.com/embed/ujjZtBRRh1I', platform: 'youtube' },
      { type: 'text', content: 'Sylwetka poetycka Wojaczka — od debiutu po tragiczny koniec. Film przybliża kontekst literacki i biograficzny twórcy, którego pomnik stał się nowym punktem na kulturalnej mapie Mikołowa.' },
      { type: 'poem', title: 'Sezon', content: 'Znowu jest sezon na śmierć\nZnowu jest sezon na krew\nZnowu jest sezon na to\nCo w nas jest najgorsze', background: '#1a1a1a' },
      { type: 'audio', url: '/audio/miejsce-pomnik.mp3', title: 'Narracja — Pomnik Rafała Wojaczka' },
      { type: 'audio', url: '/audio/wojaczek-wiersz.mp3', title: 'Wojaczek — czytanie wiersza' },
      { type: 'map', lat: 50.1696, lng: 18.9049, zoom: 18 },
    ]
  },
  {
    id: "3",
    title: "Rynek w Mikołowie",
    category: "PRZESTRZEŃ",
    lat: 50.1685,
    lng: 18.9045,
    description: "Historyczny rynek starego miasta — centralny plac, który kształtował wyobraźnię młodego Wojaczka i pojawia się w kontekście jego twórczości.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    imageUrl: "/images/rynek-ratusz.jpg",
    duration: "5:10",
    resourceCount: 7,
    media: [
      { type: 'text', content: 'Rynek w Mikołowie to serce miasta o średniowiecznym układzie urbanistycznym. Wojaczek był obserwatorem codzienności, który w banalnych gestach przechodniów dostrzegał tragizm istnienia. Spacerował tu godzinami, zapamiętując twarze i gesty, które później przetwarzał w poezję.' },
      { type: 'gallery', images: [
        { url: '/images/rynek-ratusz.jpg', caption: 'Ratusz' },
        { url: '/images/ratusz-noca.jpg', caption: 'Ratusz nocą' },
        { url: '/images/rynek-panorama.jpg', caption: 'Rynek — panorama' },
        { url: '/images/kamienice.jpg', caption: 'Kamienice rynkowe' },
      ]},
      { type: 'text', content: 'Rynek mikołowski zachował średniowieczny układ urbanistyczny. Kamienice pamiętają czasy, gdy młody Wojaczek obserwował stąd życie prowincjonalnego miasteczka. Każda twarz mijana na rynku mogła stać się bohaterem wiersza — poeta czerpał z codzienności jak z niewyczerpanego źródła.' },
      { type: 'poem', title: 'W mieście', content: 'Idę przez miasto które mnie nie zna\nI które ja nie znam\nChoć tu się urodziłem\nI tu pewnie umrę', background: '#2a1a1a' },
      { type: 'video', url: 'https://www.youtube.com/embed/Y-MZW5LopKk', platform: 'youtube' },
      { type: 'text', content: 'Wehikuł czasu cofający nas do świata Wojaczka — poetyckiego outsidera, który w mikołowskim Rynku widział scenę dla swoich egzystencjalnych dramatów. Dziś Rynek jest miejscem corocznych "Dni Wojaczka".' },
      { type: 'map', lat: 50.1685, lng: 18.9045, zoom: 19 },
      { type: 'beforeAfter', before: { url: '/images/ratusz-stary.jpg', label: 'Ratusz' }, after: { url: '/images/rynek-ratusz.jpg', label: 'Rynek' } },
      { type: 'audio', url: '/audio/miejsce-rynek.mp3', title: 'Narracja — Rynek w Mikołowie' },
      { type: 'audio', url: '/audio/wojaczek-wiersz.mp3', title: 'Wojaczek — czytanie wiersza' },
    ]
  },
  {
    id: "4",
    title: "I Liceum Ogólnokształcące",
    category: "EDUKACJA",
    lat: 50.1679,
    lng: 18.8939,
    description: "I LO im. Karola Miarki — szkoła, w której Wojaczek rozwinął talent literacki i napisał pierwsze wiersze, zanim wyjechał na studia.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    imageUrl: "/images/centrum-panoramio.jpg",
    duration: "3:45",
    resourceCount: 6,
    media: [
      { type: 'text', content: 'I Liceum Ogólnokształcące im. Karola Miarki w Mikołowie — szkoła średnia, w której uczył się Rafał Wojaczek. To właśnie w tych murach rozwinął się jego talent literacki i zainteresowanie poezją. Nauczyciele wspominali, że jego wypracowania zszokowały dojrzałością i mrocznym pięknem.' },
      { type: 'photo', url: '/images/wojaczek-portret.jpg', caption: 'Młody Rafał Wojaczek — portret poety' },
      { type: 'timeline', events: [
        { year: '1959', title: 'Początek nauki', description: 'Wojaczek rozpoczyna naukę w liceum ogólnokształcącym w Mikołowie.' },
        { year: '1961', title: 'Pierwsze wiersze', description: 'Powstają pierwsze zachowane utwory poetyckie, podziwiane przez nauczycieli.' },
        { year: '1963', title: 'Matura i wyjazd', description: 'Zdaje maturę. Wyjeżdża na studia polonistyczne — początkowo do Krakowa, potem do Wrocławia.' },
      ]},
      { type: 'poem', title: 'Szkoła', content: 'Uczyli mnie liter\nA ja uczyłem się krzyczeć\nUczyli mnie liczb\nA ja liczyłem dni do ucieczki', background: '#1a1a2a' },
      { type: 'text', content: 'Nauczyciele wspominali Wojaczka jako ucznia niezwykłego — milczącego, zamkniętego, ale piszącego wypracowania, które wprawiały w osłupienie dojrzałością i mrocznym pięknem. Już w liceum było jasne, że rodzi się wielki talent.' },
      { type: 'video', url: 'https://www.youtube.com/embed/ujjZtBRRh1I', platform: 'youtube' },
      { type: 'text', content: 'Sylwetka poety — od szkolnych lat po literacki debiut. Wojaczek opuścił mury liceum z maturą i poczuciem, że świat jest zbyt ciasny dla jego wyobraźni. Studia we Wrocławiu miały otworzyć nowy rozdział.' },
      { type: 'audio', url: '/audio/miejsce-liceum.mp3', title: 'Narracja — Liceum w Mikołowie' },
      { type: 'map', lat: 50.1679, lng: 18.8939, zoom: 17 },
    ]
  },
  {
    id: "5",
    title: "Miejski Dom Kultury",
    category: "KULTURA",
    lat: 50.1696,
    lng: 18.9044,
    description: "MDK przy Rynku 19 — centrum życia kulturalnego Mikołowa, miejsce spotkań literackich i wydarzeń poświęconych twórczości Wojaczka.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    imageUrl: "/images/instytut.jpg",
    duration: "2:55",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Miejski Dom Kultury mieści się przy Rynku 19 w zabytkowym budynku. Instytucja organizuje wydarzenia kulturalne, w tym spotkania literackie i wydarzenia poświęcone twórczości Wojaczka. To tutaj odbywają się coroczne "Dni Wojaczka" — festiwal poetycki przyciągający miłośników literatury z całej Polski.' },
      { type: 'photo', url: '/images/instytut.jpg', caption: 'Instytut Mikołowski im. Rafała Wojaczka' },
      { type: 'text', content: 'Instytut Mikołowski im. Rafała Wojaczka to jedno z najważniejszych miejsc literackich na Śląsku. Organizowane tu wydarzenia — spotkania autorskie, wieczory poetyckie, warsztaty — kultywują pamięć o poecie i inspirują kolejne pokolenia twórców.' },
      { type: 'video', url: 'https://www.youtube.com/embed/Y-MZW5LopKk', platform: 'youtube' },
      { type: 'audio', url: '/audio/miejsce-mdk.mp3', title: 'Narracja — Miejski Dom Kultury' },
      { type: 'text', content: 'Coroczne "Dni Wojaczka" przyciągają poetów, krytyków i miłośników literatury z całej Polski. To wydarzenie sprawia, że Mikołów — niewielkie śląskie miasto — staje się na kilka dni stolicą polskiej poezji.' },
      { type: 'poem', title: 'Który nie był', content: 'Byłem, który nie był\nKochałem, który nie kochał\nUmarłem, który nie umarł\nZostałem, który nie został', background: '#1a2a1a' },
    ]
  },
  {
    id: "6",
    title: "Park Planty",
    category: "PRZESTRZEŃ",
    lat: 50.1690,
    lng: 18.9016,
    description: "Zabytkowy park miejski wpisany do rejestru zabytków — zielona przestrzeń refleksji, element krajobrazu młodości poety.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    imageUrl: "/images/park-planty.jpg",
    duration: "3:30",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Małe Planty — zabytkowy park miejski w centrum Mikołowa, tuż obok Rynku. Zielona przestrzeń, która stanowiła element krajobrazu dzieciństwa i młodości poety. Park jest wpisany do rejestru zabytków. Tu Wojaczek spacerował godzinami, szukając samotności i inspiracji wśród starych drzew.' },
      { type: 'gallery', images: [
        { url: '/images/park-planty.jpg', caption: 'Park Planty' },
        { url: '/images/park-alejki.jpg', caption: 'Alejki parkowe' },
        { url: '/images/park-teznia.jpg', caption: 'Tężnia solankowa' },
        { url: '/images/park-drzewa.jpg', caption: 'Drzewa w parku' },
      ]},
      { type: 'text', content: 'Park Planty to zielona oaza w sercu Mikołowa — miejsce, gdzie czas płynie wolniej. Stare drzewa pamiętają czasy, gdy młody Wojaczek szukał tu samotności. Dziś park z tężnią solankową przyciąga spacerowiczów, ale zachował swój kontemplacyjny charakter.' },
      { type: 'poem', title: 'Drzewa', content: 'Drzewa stoją jak strażnicy\nMoich snów zapomnianych\nIch korzenie sięgają tam\nGdzie ja nigdy nie dotrę', background: '#1a1a1a' },
      { type: 'video', url: 'https://www.youtube.com/embed/ujjZtBRRh1I', platform: 'youtube' },
      { type: 'audio', url: '/audio/miejsce-park.mp3', title: 'Narracja — Park Planty' },
      { type: 'map', lat: 50.1690, lng: 18.9016, zoom: 17 },
    ]
  },
  {
    id: "7",
    title: "Ulica Rafała Wojaczka",
    category: "LITERATURA",
    lat: 50.1600,
    lng: 18.9038,
    description: "Ulica w południowej części Mikołowa nazwana imieniem poety — trwałe upamiętnienie Wojaczka w topografii jego rodzinnego miasta.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    imageUrl: "/images/deptak-kamienice.jpg",
    duration: "2:20",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Ulica Rafała Wojaczka — jednokierunkowa ulica mieszkalna w południowej części Mikołowa. Nadanie nazwy ulicy stanowi trwałe upamiętnienie poety w topografii jego rodzinnego miasta. To symboliczny gest, który sprawia, że imię Wojaczka na stałe wpisało się w codzienność Mikołowa.' },
      { type: 'photo', url: '/images/grob.jpg', caption: 'Grób Rafała i Andrzeja Wojaczków' },
      { type: 'photo', url: '/images/tablica-nagrobkowa.jpg', caption: 'Tablica nagrobkowa poety' },
      { type: 'text', content: 'Nadanie ulicy imienia Wojaczka było kontrowersyjne — poeta za życia bywał persona non grata, a jego twórczość szokuje do dziś. Jednak z perspektywy czasu stało się jasne, że Mikołów wydał jednego z najważniejszych polskich poetów powojennych.' },
      { type: 'video', url: 'https://www.youtube.com/embed/Y-MZW5LopKk', platform: 'youtube' },
      { type: 'text', content: 'Wojaczek zmarł 11 maja 1971 roku we Wrocławiu, mając zaledwie 25 lat. Pochowany został na cmentarzu w Mikołowie — wrócił do rodzinnego miasta na zawsze. Jego grób i tablica nagrobkowa są miejscem pielgrzymek literackich.' },
      { type: 'poem', title: 'Adres', content: 'Mój adres jest prosty\nMiędzy narodzinami a śmiercią\nMiędzy krzykiem a milczeniem\nMiędzy Mikołowem a nigdzie', background: '#1a1a2a' },
      { type: 'audio', url: '/audio/miejsce-ulica.mp3', title: 'Narracja — Ulica Rafała Wojaczka' },
    ]
  }
];

export const POEMS: Poem[] = [
  {
    id: "p1",
    title: "Sezon",
    year: "1965",
    content: `Jest poręcz
ale nie ma schodów
Jest ja
ale mnie nie ma
Jest zimno
ale nie ma ciepłych skór zwierząt
niedźwiedzich futer lisich kit
Od czasu kiedy jest mokro
jest bardzo mokro
ja kocha mokro
na placu, bez parasola
Jest ciemno
jest ciemno jak najciemniej
mnie nie ma
Nie ma spać
Nie ma oddychać
Żyć nie ma
Tylko drzewa się ruszają
niepospolite ruszenie drzew
rodzą czarnego kota
który przebiega wszystkie drogi`
  },
  {
    id: "p2",
    title: "Który skrzywdził",
    year: "1967",
    content: `Który skrzywdził małego chłopca
Ten niech się nie odzywa
Ten niech siada i czeka
Godzinami
Niech siedzi cicho
Jak skrzywdzony chłopiec
W kącie pokoju
Na podłodze
Niech zaciska pięści
I niech milczy
Bo gdyby się odezwał
Umarłby ze wstydu`
  },
  {
    id: "p3",
    title: "Który nie był",
    year: "1970",
    content: `Który nie był
a jednak
Który był
a przecież go nie ma
Który umarł
a ciągle się rodzi
w oku kamery
w ustach aktora
w rękach czytelnika
Który nie był sobą
był każdym z nas`
  },
  {
    id: "p4",
    title: "Prośba",
    year: "1966",
    content: `Dać mi miotłę bym zamiótł publiczny plac
Albo kobietę bym ją kochał i zapładniał
Dać mi ojczyznę bym opiewał
Pejzaż lub ustrój lżył czy chwalił rząd
Przedstawić mi człowieka bym ujrzał jego wielkość
Czy nędzę i opisał w ciekawych słowach
Wskazać mi zakochanych bym się wzruszył
Posłać mnie do szpitala. Na komunalny cmentarz
Urządzić mi teatr igrzyska sportowe
Wojnę żniwa we wsi festyn w mieście
Albo nauczyć mnie prowadzić samochód pisać na maszynie
Zmusić do nauki języków czytania gazet
A ostatecznie dać mi choć wódki żebym pił
I potem rzygał bo poetów należy używać`
  },
  {
    id: "p5",
    title: "Krzyż",
    year: "1966",
    content: `Ja jestem pozioma
Ty jesteś pionowy
Ty jesteś góra
Ja jestem dolina
Ja jestem Ziemia
Ty jesteś Słońce
Ja jestem tarcza
Ty jesteś miecz
Ja jestem rana
Ty jesteś ból
Ja jestem noc
Ty jesteś Bóg
Ty jesteś ogień
Ja jestem woda
Ja jestem naga
Ty jesteś we mnie
Ja jestem pozioma
Ale nie zawsze
Ty jesteś pionowy
Ale do czasu
Ja jestem pionowa
Góra orgazmu
Ty jesteś pionowy
Przy mnie`
  },
  {
    id: "p6",
    title: "Reszta krwi",
    year: "1967",
    content: `Widzisz
to jest Ziemia
Wygląda jak gwiazda
na dnie
łzy
Moja kochana nie wiem
co tam świeci, to pewnie
boża krówka
Mój kochany powiem:
to reszta naszej krwi
glob
prześwieca`
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: "g1", url: "/images/wojaczek-portret.jpg", title: "Portret Rafała Wojaczka" },
  { id: "g2", url: "/images/dom-rodzinny.jpg", title: "Dom Rodzinny Poety" },
  { id: "g3", url: "/images/tablica-pamiatkowa.jpg", title: "Tablica Pamiątkowa" },
  { id: "g4", url: "/images/rynek-ratusz.jpg", title: "Rynek z Ratuszem" },
  { id: "g5", url: "/images/klatka-schodowa.jpg", title: "Klatka schodowa domu poety" },
  { id: "g6", url: "/images/park-planty.jpg", title: "Park Planty" },
  { id: "g7", url: "/images/grob.jpg", title: "Grób poety" },
  { id: "g8", url: "/images/ratusz-noca.jpg", title: "Ratusz nocą" },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { year: "1945", title: "Narodziny", description: "6 grudnia w Mikołowie przychodzi na świat Rafał Mikołaj Wojaczek." },
  { year: "1959", title: "Liceum", description: "Rozpoczyna naukę w I LO im. Karola Miarki w Mikołowie." },
  { year: "1963", title: "Debiut", description: 'Pierwsze publikacje wierszy w czasopiśmie "Poezja". Matura i wyjazd na studia.' },
  { year: "1965", title: "Wrocław", description: "Przenosi się na polonistykę na Uniwersytecie Wrocławskim." },
  { year: "1969", title: "Sezon", description: 'Ukazuje się debiutancki tom wierszy "Sezon", który staje się sensacją literacką.' },
  { year: "1970", title: "Inna bajka", description: 'Wydanie drugiego tomu "Inna bajka". Wojaczek staje się ikoną buntu.' },
  { year: "1971", title: "Śmierć", description: "11 maja we Wrocławiu poeta popełnia samobójstwo w wieku 25 lat." },
  { year: "1999", title: "Film", description: 'Premiera filmu "Wojaczek" w reżyserii Lecha Majewskiego. Nagroda za reżyserię na FPFF w Gdyni.' },
  { year: "2022", title: "Pomnik", description: "13 maja odsłonięcie brązowego pomnika Wojaczka autorstwa Macieja Paździora w centrum Mikołowa." }
];

export const LETTERS: Letter[] = [
  {
    id: "l1",
    to: "Matki",
    date: "1964",
    excerpt: "Piszę do Ciebie, bo tylko Ty potrafisz zrozumieć ten ciężar, który noszę pod powiekami. Mikołów jest teraz taki szary, jakby ktoś wyssał z niego całe światło."
  },
  {
    id: "l2",
    to: "Brata",
    date: "1967",
    excerpt: "Słowa są jedyną rzeczą, która mnie jeszcze trzyma przy życiu. Reszta to tylko dekoracje, teatr dla ubogich duchem."
  },
  {
    id: "l3",
    to: "Przyjaciela",
    date: "1970",
    excerpt: "Wrocław mnie dusi. Tęsknię za spokojem mikołowskich uliczek, choć wiem, że tam też nie zaznałbym ukojenia."
  }
];
