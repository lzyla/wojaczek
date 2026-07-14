// ── Dane biografii Rafała Wojaczka ──
// Oparte na: Bogusław Kierc, "Rafał Wojaczek. Prawdziwe życie bohatera" (2007)

export interface BiographySection {
  id: string;
  title: string;
  content: string; // paragraphs separated by \n\n
}

export interface TimelineEvent {
  year: string;
  title: string;
  summary: string;
  detail: string;
  type: 'life' | 'poetry' | 'death';
}

export const BIOGRAPHY_SECTIONS: BiographySection[] = [
  {
    id: 'narodziny',
    title: 'Narodziny',
    content: `Przyjście na świat Rafała Wojaczka było dla rodziców swoistym prezentem. Urodził się szóstego grudnia 1945 roku, w dniu świętego Mikołaja, o godzinie 21:45, w kamienicy przy ulicy 1 Maja 8 w Mikołowie. Otrzymał imiona Rafał Grzegorz Mikołaj. Dziesięć dni później, szesnastego grudnia, został ochrzczony w kościele pod wezwaniem Świętego Wojciecha.

Ojciec, Edward Wojaczek, był nauczycielem — uczył matematyki i języka niemieckiego w mikołowskim gimnazjum. Już czternastego lutego 1945 roku, trzy tygodnie po wkroczeniu Armii Czerwonej do pobliskich Gliwic, rozpoczął powojenną pracę pedagogiczną. Matka, Elżbieta z domu Sobecka, również była nauczycielką. Dom przy ulicy 1 Maja 8 — ten sam, w którym dzisiaj mieści się Instytut Mikołowski — stał się kolebką jednego z najważniejszych poetów polskiej powojennej literatury.

Rafał miał starszego brata Piotra, urodzonego około 1933 roku, i młodszego Andrzeja, który przyszedł na świat dwa lata po nim. Była jeszcze siostra Kasia, urodzona około 1940 roku, która zmarła na dyfteryt we wrześniu tego samego roku, mając niespełna pięć lat. Rodzina Wojaczków została wówczas wyeksmitowana z kamienicy przy ulicy Kościelnej — sąsiedzi złożyli petycję do niemieckich władz, że nie życzą sobie mieszkać obok „polskiego nacjonalisty". Uciekli do rodzinnych Jejkowic. Dzieci zachorowały. Piotr wyzdrowiał, ale Kasia dusiła się — najbliższy lekarz, Niemiec z Rybnika, odmówił pomocy.

Ta utrata naznaczyła rodzinę milczeniem. Nigdy o Kasi głośno nie mówiono. Ale Rafał niósł ją w sobie. Lata później, już we Wrocławiu, stawał nagle na ulicy, przerywał rozmowę i tłumaczył: „Siostra, znowu siostra mnie woła". W najwcześniejszych brulionach poetyckich, jeszcze sprzed debiutu, pojawiają się próby wierszy z wezwaniem do niej — „śniąc w tej katedrze boga uwierzyłem siostro / że ciebie nie ma wcale zmiłuj się nad nami".`,
  },
  {
    id: 'dziecinstwo',
    title: 'Dzieciństwo w Mikołowie',
    content: `Mikołów lat pięćdziesiątych był małym miastem na granicy Górnego Śląska. Nowa Polska Ludowa dopiero się konsolidowała — wokół dokonywały się dramatyczne przekształcenia rzeczywistości. Na pierwszomajowych pochodach sprzedawano kiełbasę z ciężarówek, robotnicy i robotnice tańczyli rosyjskie tańce. Siedmioletni Rafał pozował do zdjęcia z ojcem i bratem Andrzejem, przekornie uśmiechnięty, z transparentami w tle.

Mieszkanie przy ulicy 1 Maja 8 liczyło sto czterdzieści metrów kwadratowych. Pokój chłopców — Rafała i Andrzeja — stał się ich autonomiczną republiką dopiero po wyjeździe Piotra na studia. W centrum stało biurko, które zastępowało im stół pingpongowy, ołtarz i podium. W jego szufladach kryły się stosy fotografii — skutek prawdziwej manii fotografowania, której oddawał się przede wszystkim ojciec. Rafał przejął ją po nim, z większym wyrafinowaniem i ambicjami artystycznymi.

Dom pachniał węglem z pieca kaflowego i drewnem z drewutni na podwórzu. W kuchni stał stary żeliwny zlew, emaliowany, z jednym kranem na zimną wodę. Według dosięgania do niego mierzyło się, ile przybyło wzrostu. Ten zlew — banalny sprzęt domowy — pojawi się później w wierszach Wojaczka jako rekwizyt graniczny między dzieciństwem a dorosłością.

Andrzej wspominał, jak trzynastoletni Rafał objaśniał mu istotę nieskończoności wszechświata. Andrzej spostrzegł wówczas przy remontowanej ulicy tablicę z napisem KONIEC. Takie anegdoty, pozornie błahe, odsłaniają temperament chłopca, który w codzienności szukał metafizycznych pęknięć. Chłopca, który w liście do „Błękitnej Sztafety" — cyklicznej audycji radiowej dla młodzieży — zaprezentował format intelektualny daleko przekraczający jego czternaście lat.`,
  },
  {
    id: 'harcerstwo',
    title: 'Harcerstwo i dojrzewanie',
    content: `Harcerstwo było dla Rafała ważnym doświadczeniem formacyjnym. Uczestniczył w obozie w Gdyni, chodził na zbiórki, poznawał rówieśników spoza Mikołowa. Szczególne znaczenie miał legendarny HOW — Harcerski Ośrodek Wodny w Wiśle Wielkiej. Tam, na obozie wodnym, spotkał Stefanię Cisek, dwa lata młodszą licealistkę. Była jego pierwszą poważną fascynacją. Pisał do niej długie, gęste listy pełne lektur, przemyśleń, tęsknoty.

Dwudziestego pierwszego sierpnia 1962 roku odbył pełny rejs morski na żaglowcu „Arka" jako bosman-praktykant. To doświadczenie — rozległość morza, rytm fal, fizyczny wysiłek — utrwaliło się w nim jako jedno z nielicznych wspomnień czystej radości.

W liceum imienia Karola Miarki w Mikołowie zaczęły się konflikty. Rafał nie pasował do szkolnej dyscypliny. Był zbyt ostry, zbyt inteligentny, zbyt niespokojny. Czytał obsesyjnie — Manna, Dostojewskiego, Kafkę, Camusa. Rilkego, Rimbauda, Baudelaire'a. Kochanowskiego, Sępa-Szarzyńskiego, Mickiewicza, Norwida, Miłosza. Ten monstrualny nawyk czytania nie był kursem literackim — był ascezą, odsłanianiem życia z powłok nakładanych na nie przez systemy wychowawcze.

Około szesnastego roku życia, w Kędzierzynie, gdzie pracował ojciec, doszło do pierwszej próby samobójczej. Odkręcił kurki pieca gazowego. Przeżył. Wydarzenie to, choć zakryte milczeniem rodziny, stało się zapowiedzią wzorca, który będzie się powtarzał — desperackiego gestu balansującego na granicy gry i prawdy.`,
  },
  {
    id: 'krakow',
    title: 'Kraków — studia i inicjacja',
    content: `Jesienią 1963 roku Rafał Wojaczek rozpoczął studia polonistyczne na Uniwersytecie Jagiellońskim. Zamieszkał w akademiku „Żaczek" przy ulicy 3 Maja. Jego współlokatorem został Jerzy Kronhold — ich spotkanie miało charakter znaku: obaj pojawili się tego samego dnia z tym samym tomem „Sensu poetyckiego" Juliana Przybosia. Książka okazała się „znakiem rozpoznawczym" przynależności do „braci surowszej reguły".

Kraków tamtych lat był miastem poetyckich fermentów. Studiowali wówczas Julian Kornhauser, Adam Zagajewski, Helmut Kajzar. Sam Przyboś — ówczesny arcymistrz i najwyższy prawodawca polskiej poezji — pojawiał się w „Żaczku". Jego przykazanie „Pisz tak, jakby słowa miały być ostatnimi twoimi słowami, jakbyś pisał testament" stało się dla Rafała miarą, do której pragnął przyłożyć swoje pisanie. Zanim zaczął tę miarę przykładać do swojego życia.

Rafał żył oszczędnie. Sześćset złotych przysyłanych z domu przeznaczał głównie na książki. Żywił się w barach mlecznych — bułka z mlekiem na śniadanie, naleśniki na obiad. Bywało, że jadł bułki znalezione na śmietnikach. Ale to wygłodzenie było czymś więcej niż biedą studencką — było cierpliwym stwarzaniem bohatera, który miał go zastąpić.

Nocne wędrówki po Krakowie układały się w oniryczny labirynt. Jego drogi krakowskie, wbrew pozorom, były wytyczone dawnym szlakiem ojca, który krótko studiował teologię. Ale Rafał nie szukał ojca — szukał syna. Tego pisanego dużą literą, przychodzącego nie z Pisma Świętego wprost, lecz z pism Dostojewskiego.`,
  },
  {
    id: 'szpital',
    title: 'Szpital psychiatryczny',
    content: `We wrześniu 1964 roku Rafał żyletką przeciął tętnicę i odkręcił kurki gazowe. Przeżył, ale trafił do krakowskiej kliniki psychiatrycznej. Prowadził tam dziennik — drobiazgowy, bezlitosny zapis codzienności szpitalnej. Te notatki, później przetworzone w poemat prozą „Sanatorium", stały się jednym z najbardziej przejmujących dokumentów jego pisarstwa.

W klinice poznał Annę Kowalską — studentkę medycyny odbywającą praktykę pielęgniarską. Była piękna, konkretna, z innego świata niż jego poetyckie obsesje. Ich spotkanie miało w sobie coś z fatalnej logiki — poeta spotyka pielęgniarkę w szpitalu dla umysłowo chorych.

Szpital nie był dla Rafała tylko miejscem leczenia. Był laboratorium doświadczeń granicznych, przestrzenią, w której granice między normą a szaleństwem, między życiem a śmiercią okazywały się absurdalnie cienkie. Bohater jego „Sanatorium", Piotr G. Sobecki, przedstawiony jest w całej nędzy codziennego bytowania, w beznadziei alkoholowych pocieszeń, w upokorzeniu bezsilnością motywowaną wymaganiami powołania.

To doświadczenie psychiatryczne nie było jednorazowe. Rafał wielokrotnie wracał do szpitali. Każdy pobyt zasilał jego pisarstwo, ale też pogłębiał spiralę samozniszczenia, którą sam w sobie obserwował z chirurgiczną precyzją.`,
  },
  {
    id: 'debiut',
    title: 'Debiut w „Poezji"',
    content: `W grudniu 1965 roku w miesięczniku „Poezja" ukazały się pierwsze opublikowane wiersze Rafała Wojaczka. Polecił go Tymoteusz Karpowicz — jeden z nielicznych, którzy od początku rozpoznali skalę jego talentu. To Karpowicz stał się mentorem, mistrzem, surowym sędzią i obrońcą Wojaczka w środowisku literackim.

Debiut w „Poezji" był momentem przełomowym. Rafał miał dwadzieścia lat i nagle stał się widoczny. Jego wiersze uderzały bezkompromisowością, cielesnością języka, zderzeniem sacrum z profanum. Pisał tak, jak nikt przed nim w polskiej poezji nie pisał — z etyczną brutalnością, która zawłaszczała obszary strzeżone przez publiczne i polityczne tabu.

Julian Przyboś, współredaktor „Poezji", rozpoznał w nim talent, choć styl Wojaczka był czymś zupełnie obcym wobec awangardowej poetyki Przybosia. Rafał nie był epigonem niczyjego stylu. Jego poetyka — którą Kierc nazywa „chirurgią językiem" — wyrastała z Rimbauda i Baudelaire'a, ale przeszczepiona na grunt polszczyzny nabrała zupełnie nowego, brutalnego życia.

Publikował również w „Odrze", głównym wrocławskim magazynie literackim. Wrocław, do którego przeniósł się na polonistykę, stał się jego miastem — areną życia i autodestrukcji, sceną, na której rozgrywał się dramat „prawdziwego bohatera".`,
  },
  {
    id: 'milosc',
    title: 'Miłość i małżeństwo',
    content: `Jedenastego stycznia 1966 roku Rafał Wojaczek poślubił Annę Kowalską. Świadkiem na ślubie był Rudolf Szwajcera, kolega szkolny. Małżeństwo trwało zaledwie kilka miesięcy, ale jego owocem była córka Dagmara, urodzona piętnastego czerwca 1966 roku.

Anna była z innego świata — konkretna, racjonalna, medyczna. Rafał potrzebował kobiety jako lustra, w którym mógłby ujrzeć swojego bohatera. Ale lustro musiało być wystarczająco twarde, żeby nie pęknąć od tego, co w nim zobaczył. Anna nie pękła — odeszła.

Wiosną 1966 roku w życiu Rafała pojawiła się Teresa Ziomber. Ich związek, trwający do listopada 1969 roku, stał się jednym z najintensywniejszych doświadczeń jego życia. Teresa była muzą — nie w sentymentalnym, poetyckim sensie, lecz jako realna kobieta, do której pisał listy pełne teologicznych rozważań, erotycznych wizji i rozpaczliwej czułości. W liście do niej z 25 kwietnia 1966 roku wyznał swoją „żydowskość" — „to moje myślenie talmudyczne, quasi-dialektyczne, bo nie zmierzające do syntezy, lecz raczej obracające się po obwodzie, dążące do zamknięcia koła".

Kobiety w życiu Wojaczka były czymś więcej niż kochankami. Były postaciami w dramacie, który reżyserował ze swoim bohaterem. „Mówię do Ciebie, jak chłopiec" — pisał do Stefy. „Będziesz mnie pamiętać jako wesołego chłopca". A potem dodawał: „Stałaś się dla mnie czymś niedostępnym, zbyt idealnym, zbyt wysoko jesteś".`,
  },
  {
    id: 'wroclaw',
    title: 'Wrocław — tworzenie i autodestrukcja',
    content: `Wrocław stał się areną głównego aktu dramatu Rafała Wojaczka. Mieszkał przy ulicy Stolarskiej 76. Publikował, pisał obsesyjnie, pił. Bywał w Klubie Muzyki i Literatury, w Związku Literatów. Znał wszystkich i wszyscy znali jego. Ale to poznanie miało podwójne dno — ludzie znali Wojaczka-legendę, postać z anegdot o wyskokach przez okno i bitkach z portierami.

Dwudziestego października 1967 roku doszło do słynnego incydentu w Związku Twórczych we Wrocławiu. Pijany Rafał próbował wejść siłą do lokalu, strofował prezesa przy delegacji niemieckiej, uderzył portiera w szczękę. Protokół milicyjny jest suchy — imię, nazwisko, data urodzenia, adres, zarzut. Ale Rafał przetworzył tę historię w groteskową litanię na cześć portiera — „Męczenniku obowiązku, chwalebny wzorze gorliwego wypełniania powinności..."

Opowiadano o nim z mieszanką podziwu i przerażenia. O przejściach przez szklane drzwi, o wyskokach z drugiego piętra, o zgubionym buciku szukanym przez nieszczęsnego, a nieposzkodowanego skoczka. O wściekłości na siebie, kiedy zadźgawszy się w szyję, uratowany, musiał zapłacić za czterdzieści szwów. Ale on sam tej sympatii dla swojego bohatera nie podzielał, skłonny raczej trzymać z tymi, których krzywdził.

W tym chaosie powstawały wiersze o przejmującej precyzji formalnej. To był paradoks Wojaczka: poezja buntu, łamiąca wszelkie reguły, wykrystalizowywała rygorystyczne formy wiersza regularnego. Dobrze wychowany, wrażliwy młodzieniec wcielał się w postać „Tego skurwysyna Wojaczka, poety".`,
  },
  {
    id: 'tomy',
    title: 'Tomy poetyckie',
    content: `W lipcu 1967 roku ukazał się pierwszy tom — „Sezon". Zawierał wiersze pisane od 1965 roku, około czterdziestu tekstów. Tytuł, nawiązujący do Rimbauda i jego „Sezonu w piekle", nie był przypadkowy. Wojaczek traktował Rimbauda jak brata — pokrewnego duchem, nie stylem.

W 1969 roku wyszła „Inna bajka" — drugi i ostatni tom opublikowany za życia. Był mroczniejszy, gęstszy, bardziej hermetyczny. Wojaczek rozwinął w nim swoją poetykę zderzania rejestrów — liturgia obok wulgaryzmu, anatomia obok psalmu, rachunek obok modlitwy. Ciało w jego wierszach jest anatomiczne: żyły, obojczyk, kość ogonowa, łopatki, pachwiny, chrząstka, ślina, żółć. Nigdy abstrakcyjne.

Trzeci tom, „Którego nie było", ukazał się pośmiertnie. Tytuł, czytany po śmierci autora, nabiera dodatkowego, dojmującego sensu — „którego nie było" to zarówno poetycki podmiot, jak i sam Wojaczek, którego już nie ma.

Karpowicz, Łukasiewicz i może dwóch innych ludzi ze środowiska mieli kompetencje, by krytycznie orzekać o jego wierszach. Reszta albo podziwiała, albo nie rozumiała. Rafał wiedział o tym i nie zmniejszało to przyjemności, z jaką wysłuchiwał pochwał, świadomy ich zdawkowego poloru.`,
  },
  {
    id: 'marzec68',
    title: 'Rok 1968',
    content: `Rok 1968 był dla Wojaczka okresem intensywnej twórczości. Marcowe wydarzenia polityczne — studenckie protesty, antysemicka nagonka, atmosfera zastraszenia — przeszły przez Wrocław jak wstrząs. Rafał nie był typowym „zaangażowanym" poetą, ale wydarzenia te nie mogły go nie dotknąć. Żył w tym samym Wrocławiu, chodził tymi samymi ulicami, pił w tych samych knajpach co studenci, których pałowano i wyrzucano z uczelni.

Jego poezja odpowiedziała na ten czas nie manifestami, lecz pogłębieniem mroku. Napisał wówczas niektóre z najważniejszych wierszy, w tym „Piosenkę z najwyższej wieży" — utwór, w którym sacrum i profanum zderzają się z siłą, jakiej nie znała dotąd polska liryka. „Ja jestem wieża, abym wyniośle wciąż nad siebie mógł róść" — to nie metafora, to wyznanie wiary poety w wieżę kościoła jako upostaciowanie obecności Boga.

W tym samym roku powstała „Ojczyzna", zaczynająca się zdaniem „Matka mądra jak wieża kościoła". Wieża Dawidowa, Wieża z kości słoniowej — Litania Loretańska, dobrze Rafałowi znana, rezonowała w tych wierszach nowym, niepokojącym brzmieniem.`,
  },
  {
    id: 'upadek',
    title: 'Spirala — 1969–1971',
    content: `Drugiego stycznia 1969 roku Rafał trafił do szpitala po kolejnej próbie samobójczej. Spirala się zaciskała. Pił coraz więcej, pisał coraz mniej, ale to, co pisał, osiągało nową jakość — gęstą, skondensowaną, bliską ostatniego tchnienia.

Związek z Teresą Ziomber rozpadł się w listopadzie 1969 roku. Na przełomie lat napisał „Zapis z podziemia" — tekst przeznaczony na Nowy Rok 1970, rodzaj poetyckiego testamentu, choć śmierć była jeszcze o rok dalej.

Jego zachowanie stawało się coraz bardziej nieprzewidywalne. Skakał przez szyby, wyskakiwał z okien, kaleczył się, prowokował bijatyki. Ale w każdym z tych gestów była ta sama rozpaczliwa logika — potwierdzanie realności istnienia przez ból. „Moje ciało jest jedynym dowodem istnienia" — ta formuła, choć nigdy tak wprost niewypowiedziana, przenika całe jego życie.

W ostatnich miesiącach pojawiła się Elżbieta Fediuk — kobieta, do której pisał ostatnie listy. Listy pełne zmęczenia i dziwnej pogody, jakby już wiedział.`,
  },
  {
    id: 'smierc',
    title: 'Ostatnie dni',
    content: `Piątego maja 1971 roku Rafał odwiedził Kędzierzyn. Stamtąd napisał list do Elżbiety Fediuk. Szóstego maja wrócił do Wrocławia, szukał nowego lokum. Siódmego maja wysłał ostatni list z Wrocławia. Ósmego maja, wieczorem, nieoczekiwanie pojawił się w Mikołowie, w domu rodzinnym.

Matka zapamiętała, że wyglądał „wypogodzony" — dziwnie spokojny, jakby rozjaśniony. To słowo — „wypogodzony" — niesie w sobie cały ciężar tego, co nastąpiło potem.

Ósmego maja 1971 roku Rafał Wojaczek powiesił się w domu ojca. Miał dwadzieścia pięć lat, pięć miesięcy i dwa dni.

Parę godzin wcześniej pisał do Bogusława Kierca: „Noszę tę swoją nieobecność — spoconą, koszmarną, wyczekuję na taką chwilę zgody — równowagi, że nie będzie powiedziane być mogło, że w chwili rozstroju".

Ostatni wiersz, jaki napisał — albo ostatni, o którym wiemy — nosi datę ósmego marca 1971 roku. Dzień Kobiet. Dzień, który traktował poważnie, jako prawdziwe święto. Dzień, w którym okazywał szacunek kobietom. Zwłaszcza matce.

Pochowany został na cmentarzu w Mikołowie. Dwadzieścia pięć lat po jego śmierci ukazał się najpełniejszy zbiór wierszy w „Bibliotece Klasyki" — w serii, w której pojawiały się wyłącznie dzieła klasyków. Pytanie, czy ćwierć wieku jest wystarczającą miarą czasu, by sprawdzić trwałość dzieła, okazało się retoryczne.`,
  },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '1945',
    title: 'Narodziny',
    summary: 'Mikołów, 6 grudnia, godz. 21:45',
    detail:
      'Rafał Grzegorz Mikołaj Wojaczek przychodzi na świat w kamienicy przy ulicy 1 Maja 8 w Mikołowie. Syn Edwarda (nauczyciela) i Elżbiety (nauczycielki). Ochrzczony 16 grudnia w kościele św. Wojciecha.',
    type: 'life',
  },
  {
    year: '~1950',
    title: 'Dzieciństwo',
    summary: 'Pokój chłopców, harcerstwo, lektury',
    detail:
      'Rafał dorasta w Mikołowie z bratem Andrzejem. Pokój chłopców z biurkiem pełnym fotografii. Ojciec Edward fotografuje obsesyjnie — Rafał przejmie tę pasję. Pierwszy kontakt z harcerstwem, obóz w Gdyni.',
    type: 'life',
  },
  {
    year: '~1959',
    title: 'List do „Błękitnej Sztafety"',
    summary: 'Czternastolatek o niepokojącej dojrzałości',
    detail:
      'W szufladzie biurka zachował się list czternastoletniego Rafała do audycji radiowej. Dokument o formacie intelektualnym daleko przekraczającym wiek. Czyta obsesyjnie — Manna, Dostojewskiego, Kafkę, Rimbauda.',
    type: 'life',
  },
  {
    year: '1962',
    title: 'Rejs na „Arce"',
    summary: '21 VIII — bosman-praktykant',
    detail:
      'Rafał odbywa pełny rejs morski na żaglowcu jako bosman-praktykant. Jedno z nielicznych wspomnień czystej radości. W Harcerskim Ośrodku Wodnym w Wiśle Wielkiej poznaje Stefanię Cisek, swoją pierwszą miłość.',
    type: 'life',
  },
  {
    year: '1963',
    title: 'Studia w Krakowie',
    summary: 'Polonistyka na UJ, akademik „Żaczek"',
    detail:
      'Rozpoczyna studia polonistyczne na Uniwersytecie Jagiellońskim. Mieszka w „Żaczku" z Jerzym Kronholdem. Spotyka Przybosia, Różewicza, Harasymowicza. Żyje za 600 złotych miesięcznie — większość wydaje na książki.',
    type: 'life',
  },
  {
    year: '1964',
    title: 'Pierwsza próba samobójcza',
    summary: '10 września — żyletka i gaz',
    detail:
      'Przecina żyletką tętnicę i odkręca kurki gazowe. Trafia do kliniki psychiatrycznej w Krakowie. Poznaje Annę Kowalską, studentkę medycyny. Prowadzi dziennik szpitalny, z którego wyrośnie poemat „Sanatorium".',
    type: 'life',
  },
  {
    year: 'XII 1965',
    title: 'Debiut w „Poezji"',
    summary: 'Polecony przez Tymoteusza Karpowicza',
    detail:
      'W grudniowym numerze „Poezji" ukazują się pierwsze opublikowane wiersze. Karpowicz staje się jego mistrzem i obrońcą w środowisku literackim. Rafał przenosi się na polonistykę do Wrocławia.',
    type: 'life',
  },
  {
    year: 'I 1966',
    title: 'Ślub z Anną Kowalską',
    summary: '11 stycznia — małżeństwo',
    detail:
      'Poślubia Annę, poznaną w klinice psychiatrycznej. Świadkiem jest Rudolf Szwajcera. Małżeństwo trwa kilka miesięcy. 15 czerwca rodzi się córka Dagmara.',
    type: 'life',
  },
  {
    year: '1967',
    title: '„Sezon" — pierwszy tom',
    summary: 'Lipiec — debiut książkowy',
    detail:
      'Ukazuje się „Sezon" — pierwszy tom poetycki Wojaczka. Około czterdziestu wierszy pisanych od 1965 roku. Tytuł nawiązuje do Rimbauda. Wrocław staje się areną życia i autodestrukcji — mieszka przy ul. Stolarskiej 76.',
    type: 'poetry',
  },
  {
    year: '1968',
    title: 'Rok twórczego szczytu',
    summary: 'Marzec, protesty, najważniejsze wiersze',
    detail:
      'Intensywna twórczość na tle marcowych wydarzeń politycznych. Powstają „Piosenka z najwyższej wieży", „Ojczyzna" i inne kluczowe teksty. Zderzenie sacrum z profanum osiąga apogeum.',
    type: 'life',
  },
  {
    year: '1969',
    title: '„Inna bajka" — drugi tom',
    summary: 'Mroczniejszy, gęstszy, bardziej hermetyczny',
    detail:
      'Ukazuje się drugi i ostatni tom opublikowany za życia. Zderzanie rejestrów — liturgia obok wulgaryzmu, anatomia obok psalmu. 2 I 1969 — kolejna próba samobójcza i hospitalizacja. W listopadzie kończy się związek z Teresą Ziomber.',
    type: 'poetry',
  },
  {
    year: '1970–71',
    title: 'Ostatni rok',
    summary: 'Autodestrukcja, prowokacje, ostatnie wiersze',
    detail:
      'Zachowanie coraz bardziej nieprzewidywalne: skoki przez szyby, wyskoki z okien, prowokacje. Pisze intensywnie — powstają ostatnie wiersze. Pojawia się Elżbieta Fediuk — adresatka ostatnich listów. Coraz częstsze pobyty w szpitalach.',
    type: 'life',
  },
  {
    year: '8 V 1971',
    title: 'Śmierć',
    summary: 'Mikołów — dom ojca',
    detail:
      '5 V odwiedza Kędzierzyn, 7 V wysyła ostatni list z Wrocławia. 8 maja wieczorem przyjeżdża niespodziewanie do Mikołowa. Matka wspomina, że wyglądał „wypogodzony". Tego dnia Rafał Wojaczek popełnia samobójstwo przez powieszenie. Miał 25 lat, 5 miesięcy i 2 dni.',
    type: 'death',
  },
];

// Full text for "Listen" mode — concatenated from sections
export const BIOGRAPHY_FULL_TEXT = BIOGRAPHY_SECTIONS.map(
  (s) => s.content
).join('\n\n');
