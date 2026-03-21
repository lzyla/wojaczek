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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/Rafa%C5%82_Wojaczek._Dom_rodzinny_poety..JPG",
    duration: "4:20",
    resourceCount: 8,
    media: [
      { type: 'text', content: 'Rafał Wojaczek urodził się 6 grudnia 1945 roku w Mikołowie, w kamienicy przy ulicy Jana Pawła II (dawniej ul. 1 Maja). Dom rodzinny stał się pierwszą sceną jego poetyckiego życia. Na fasadzie budynku znajduje się tablica pamiątkowa upamiętniająca poetę — jednego z najważniejszych polskich twórców XX wieku.' },
      { type: 'photo', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Miko%C5%82%C3%B3w_-_Tablica_pami%C4%85tkowa_Rafa%C5%82a_Wojaczka.jpg', caption: 'Tablica pamiątkowa na domu rodzinnym poety' },
      { type: 'gallery', images: [
        { url: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Tablica_pami%C4%85tkowa_na_kamienicy%2C_domu_rodzinnym_poety_w_Miko%C5%82owie._1.JPG', caption: 'Tablica z bliska' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Tablica_pami%C4%85tkowa_na_kamienicy%2C_domu_rodzinnym_poety_w_Miko%C5%82owie._2.JPG', caption: 'Tablica — widok z boku' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Rafa%C5%82_Wojaczek._Dom_rodzinny_poety._%28klatka_schodowa%29.JPG', caption: 'Klatka schodowa' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Rafa%C5%82_Wojaczek._Dom_rodzinny_poety._%28klatka_schodowa%29_2.JPG', caption: 'Klatka schodowa — widok z góry' },
      ]},
      { type: 'text', content: 'Wojaczek dorastał w cieniu górnośląskiej codzienności — między kominami hut a ciszą podmiejskich podwórek. Kamienica, w której się urodził, stała się później symbolem jego poetyckiego początku. Mieszkańcy Mikołowa do dziś wspominają rodzinę Wojaczków.' },
      { type: 'video', url: 'https://www.youtube.com/embed/Y-MZW5LopKk', platform: 'youtube' },
      { type: 'text', content: 'Film dokumentalny przybliża postać poety — jego dzieciństwo w Mikołowie, trudne relacje rodzinne i pierwsze zetknięcie ze słowem pisanym. Wojaczek od najmłodszych lat wyróżniał się wrażliwością, która później przerodziła się w poetycki geniusz.' },
      { type: 'poem', title: 'Który skrzywdził', content: 'Nie chcę tu mieszkać\nw tym domu moich rodziców\ngdzie wszystko jest prawdziwe\ni nic nie jest możliwe', background: '#1a1a1a' },
      { type: 'audio', url: '/audio/miejsce-dom.mp3', title: 'Narracja — Dom Rodzinny Wojaczka' },
      { type: 'audio', url: '/audio/wojaczek-wiersz.mp3', title: 'Wojaczek — czytanie wiersza' },
      { type: 'beforeAfter', before: { url: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Rafa%C5%82_Wojaczek._Dom_rodzinny_poety..JPG', label: 'Archiwalne' }, after: { url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Miko%C5%82%C3%B3w_-_Tablica_pami%C4%85tkowa_Rafa%C5%82a_Wojaczka.jpg', label: 'Współcześnie' } },
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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/10/Wojaczek-tablica.JPG",
    duration: "3:15",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Pomnik Rafała Wojaczka autorstwa rzeźbiarza Macieja Paździora został odsłonięty 13 maja 2022 roku w centrum Mikołowa. Brązowa rzeźba przedstawia poetę siedzącego na ławce — w okularach przeciwsłonecznych, z papierosem. Jest najnowszym upamiętnieniem twórcy w jego rodzinnym mieście.' },
      { type: 'photo', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Rafa%C5%82_Wojaczek.jpg', caption: 'Portret Rafała Wojaczka' },
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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Miko%C5%82%C3%B3w_Rynek_w_Miko%C5%82owieratusz_%28cropped%29.jpg",
    duration: "5:10",
    resourceCount: 7,
    media: [
      { type: 'text', content: 'Rynek w Mikołowie to serce miasta o średniowiecznym układzie urbanistycznym. Wojaczek był obserwatorem codzienności, który w banalnych gestach przechodniów dostrzegał tragizm istnienia. Spacerował tu godzinami, zapamiętując twarze i gesty, które później przetwarzał w poezję.' },
      { type: 'gallery', images: [
        { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Miko%C5%82%C3%B3w_Rynek_w_Miko%C5%82owieratusz_%28cropped%29.jpg', caption: 'Ratusz' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Miko%C5%82%C3%B3w_-_Ratusz_noc%C4%85_1.JPG', caption: 'Ratusz nocą' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Miko%C5%82%C3%B3w_-_Rynek.JPG', caption: 'Rynek — panorama' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/PLMikolow_MarketPlace.JPG', caption: 'Kamienice rynkowe' },
      ]},
      { type: 'text', content: 'Rynek mikołowski zachował średniowieczny układ urbanistyczny. Kamienice pamiętają czasy, gdy młody Wojaczek obserwował stąd życie prowincjonalnego miasteczka. Każda twarz mijana na rynku mogła stać się bohaterem wiersza — poeta czerpał z codzienności jak z niewyczerpanego źródła.' },
      { type: 'poem', title: 'W mieście', content: 'Idę przez miasto które mnie nie zna\nI które ja nie znam\nChoć tu się urodziłem\nI tu pewnie umrę', background: '#2a1a1a' },
      { type: 'video', url: 'https://www.youtube.com/embed/Y-MZW5LopKk', platform: 'youtube' },
      { type: 'text', content: 'Wehikuł czasu cofający nas do świata Wojaczka — poetyckiego outsidera, który w mikołowskim Rynku widział scenę dla swoich egzystencjalnych dramatów. Dziś Rynek jest miejscem corocznych "Dni Wojaczka".' },
      { type: 'map', lat: 50.1685, lng: 18.9045, zoom: 19 },
      { type: 'beforeAfter', before: { url: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Ratusz_Miko%C5%82%C3%B3w.JPG', label: 'Ratusz' }, after: { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Miko%C5%82%C3%B3w_Rynek_w_Miko%C5%82owieratusz_%28cropped%29.jpg', label: 'Rynek' } },
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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Centrum%2C_Miko%C5%82%C3%B3w%2C_Poland_-_panoramio_%281%29.jpg",
    duration: "3:45",
    resourceCount: 6,
    media: [
      { type: 'text', content: 'I Liceum Ogólnokształcące im. Karola Miarki w Mikołowie — szkoła średnia, w której uczył się Rafał Wojaczek. To właśnie w tych murach rozwinął się jego talent literacki i zainteresowanie poezją. Nauczyciele wspominali, że jego wypracowania zszokowały dojrzałością i mrocznym pięknem.' },
      { type: 'photo', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Rafa%C5%82_Wojaczek.jpg', caption: 'Młody Rafał Wojaczek — portret poety' },
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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Instytut_Mikolowski_z_zewnatrz_tablica.jpg",
    duration: "2:55",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Miejski Dom Kultury mieści się przy Rynku 19 w zabytkowym budynku. Instytucja organizuje wydarzenia kulturalne, w tym spotkania literackie i wydarzenia poświęcone twórczości Wojaczka. To tutaj odbywają się coroczne "Dni Wojaczka" — festiwal poetycki przyciągający miłośników literatury z całej Polski.' },
      { type: 'photo', url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Instytut_Mikolowski_z_zewnatrz_tablica.jpg', caption: 'Instytut Mikołowski im. Rafała Wojaczka' },
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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/02/Miko%C5%82%C3%B3wPlanty.jpg",
    duration: "3:30",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Małe Planty — zabytkowy park miejski w centrum Mikołowa, tuż obok Rynku. Zielona przestrzeń, która stanowiła element krajobrazu dzieciństwa i młodości poety. Park jest wpisany do rejestru zabytków. Tu Wojaczek spacerował godzinami, szukając samotności i inspiracji wśród starych drzew.' },
      { type: 'gallery', images: [
        { url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Miko%C5%82%C3%B3wPlanty.jpg', caption: 'Park Planty' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Miko%C5%82%C3%B3w%2C_park_Planty.1..JPG', caption: 'Alejki parkowe' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Mikolow-Planty_Teznia-2021.jpg', caption: 'Tężnia solankowa' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/PLANTY_MIKOLOW.JPG', caption: 'Drzewa w parku' },
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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Deptak_wzd%C5%82u%C5%BC_pieknych_kamienic_-_panoramio.jpg",
    duration: "2:20",
    resourceCount: 5,
    media: [
      { type: 'text', content: 'Ulica Rafała Wojaczka — jednokierunkowa ulica mieszkalna w południowej części Mikołowa. Nadanie nazwy ulicy stanowi trwałe upamiętnienie poety w topografii jego rodzinnego miasta. To symboliczny gest, który sprawia, że imię Wojaczka na stałe wpisało się w codzienność Mikołowa.' },
      { type: 'photo', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Gr%C3%B3b_Rafa%C5%82a_i_Andrzeja_Wojaczk%C3%B3w.jpg', caption: 'Grób Rafała i Andrzeja Wojaczków' },
      { type: 'photo', url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Rafal_wojaczek_tablica_nagrobkowa.jpg', caption: 'Tablica nagrobkowa poety' },
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
    year: "1969",
    content: "Znowu jest sezon na śmierć\nZnowu jest sezon na krew\nZnowu jest sezon na to\nCo w nas jest najgorsze"
  },
  {
    id: "p2",
    title: "Który skrzywdził",
    year: "1967",
    content: "Nie chcę tu mieszkać\nw tym domu moich rodziców\ngdzie wszystko jest prawdziwe\ni nic nie jest możliwe"
  },
  {
    id: "p3",
    title: "Który nie był",
    year: "1970",
    content: "Byłem, który nie był\nKochałem, który nie kochał\nUmarłem, który nie umarł\nZostałem, który nie został"
  },
  {
    id: "p4",
    title: "Prośba",
    year: "1968",
    content: "Nie pytaj mnie o nic\nbo nie wiem nic\nprócz tego co mi mówią\nmoje ręce"
  },
  {
    id: "p5",
    title: "W mieście",
    year: "1969",
    content: "Idę przez miasto które mnie nie zna\nI które ja nie znam\nChoć tu się urodziłem\nI tu pewnie umrę"
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: "g1", url: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Rafa%C5%82_Wojaczek.jpg", title: "Portret Rafała Wojaczka" },
  { id: "g2", url: "https://upload.wikimedia.org/wikipedia/commons/5/53/Rafa%C5%82_Wojaczek._Dom_rodzinny_poety..JPG", title: "Dom Rodzinny Poety" },
  { id: "g3", url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Miko%C5%82%C3%B3w_-_Tablica_pami%C4%85tkowa_Rafa%C5%82a_Wojaczka.jpg", title: "Tablica Pamiątkowa" },
  { id: "g4", url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Miko%C5%82%C3%B3w_Rynek_w_Miko%C5%82owieratusz_%28cropped%29.jpg", title: "Rynek z Ratuszem" },
  { id: "g5", url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Rafa%C5%82_Wojaczek._Dom_rodzinny_poety._%28klatka_schodowa%29.JPG", title: "Klatka schodowa domu poety" },
  { id: "g6", url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Miko%C5%82%C3%B3wPlanty.jpg", title: "Park Planty" },
  { id: "g7", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Gr%C3%B3b_Rafa%C5%82a_i_Andrzeja_Wojaczk%C3%B3w.jpg", title: "Grób poety" },
  { id: "g8", url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Miko%C5%82%C3%B3w_-_Ratusz_noc%C4%85_1.JPG", title: "Ratusz nocą" },
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
