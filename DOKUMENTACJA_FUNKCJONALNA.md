# Dokumentacja funkcjonalna aplikacji „Śladami Wojaczka”

Stan dokumentu: 27 maja 2026  
Podstawa opracowania: analiza aktualnego kodu aplikacji frontendowej, endpointów API i zaplecza administracyjnego.

## 1. Cel dokumentu

Dokument opisuje funkcjonalny zakres aplikacji „Śladami Wojaczka” / „Wojaczek – Mapa Obecności”. Skupia się na tym:

- do czego służy aplikacja,
- jakie moduły są dostępne dla użytkownika,
- jakie scenariusze użytkownika wspiera,
- jakie są reguły działania poszczególnych funkcji,
- jakie ograniczenia i zależności wpływają na działanie systemu.

Dokument nie jest dokumentacją techniczną wdrożenia ani instrukcją programistyczną.

## 2. Cel aplikacji

Aplikacja jest mobilnym, pionowym przewodnikiem literacko-miejskim po Mikołowie, poświęconym Rafałowi Wojaczkowi. Łączy:

- narrację biograficzną,
- eksplorację miejsc związanych z poetą,
- czytanie i interpretację wierszy,
- analitykę korpusu poetyckiego,
- funkcje generatywne AI.

Głównym celem produktu jest zamiana klasycznego przewodnika lub archiwum w doświadczenie immersyjne: spacer, lekturę, odsłuch, analizę i twórczą interakcję.

## 3. Użytkownicy i role

### 3.1. Użytkownik końcowy

Główny odbiorca aplikacji. Korzysta z treści bez logowania. Może:

- przeglądać miejsca i materiały multimedialne,
- uruchamiać spacer i nawigację do kolejnych punktów,
- czytać biografię i wiersze,
- słuchać treści,
- korzystać z czatu stylizowanego na „cień poety”,
- przeglądać interpretacje i analizy,
- generować nowe wiersze inspirowane poetyką Wojaczka.

### 3.2. Redaktor / administrator treści

Rola zaplecza treści, obsługiwana przez panel administracyjny Django. Może zarządzać:

- miejscami,
- blokami mediów przypisanymi do miejsc,
- wierszami,
- listami,
- galerią,
- osią czasu,
- plikami audio,
- ustawieniami mapy.

### 3.3. Administrator techniczny

Rola odpowiedzialna za konfigurację środowiska, kluczy API i publikację danych. Ta rola nie ma osobnego interfejsu biznesowego w aplikacji użytkownika.

## 4. Zakres funkcjonalny

Aktualny produkt obejmuje następujące obszary:

1. ekran wejściowy,
2. opis projektu i wejście w doświadczenie,
3. lista / esej wprowadzający o mieście i poecie,
4. ścieżka spacerowa po punktach,
5. mapa miejsc,
6. karta szczegółowa miejsca,
7. nawigacja terenowa,
8. lekki tryb AR dla wybranych punktów,
9. moduł biograficzny z pięcioma trybami odbioru,
10. moduł wierszy i interpretacji,
11. moduł eksploracji danych korpusu poetyckiego,
12. generator nowych wierszy,
13. strona informacyjna o projekcie.

## 5. Architektura informacji i nawigacja

### 5.1. Główne wejścia

Po uruchomieniu użytkownik trafia na ekran intro. Następnie może przejść do widoku głównego.

W górnym pasku stale dostępne są:

- przycisk z nazwą aplikacji, który przenosi do widoku listy,
- przycisk menu otwierający główną nawigację.

### 5.2. Pozycje menu głównego

| Etykieta w menu | Funkcja |
|---|---|
| Życiorys | wejście do modułu biograficznego |
| Wiersze | wejście do modułu lektury i interpretacji wierszy |
| Ślady | wejście do widoku głównego z opisem miejsc |
| Mapa | wejście do mapy punktów |
| Maszyna do wierszy | wejście do generatora AI |
| Eksploracja | wejście do modułu analiz korpusu |
| O aplikacji | informacje o projekcie |

### 5.3. Widoki obecne w kodzie, ale niewystawione w głównej nawigacji

W repozytorium istnieją również dodatkowe widoki:

- osobna galeria,
- osobny widok listów,
- osobny widok refleksji AI,
- osobny widok mockupów AI,
- osobny widok osi czasu.

Nie są one obecnie wystawione w głównym menu aplikacji. Oś czasu jest dostępna pośrednio jako zakładka w module „Życiorys”.

## 6. Główne scenariusze użytkownika

### 6.1. Zwiedzanie miejsc związanych z poetą

1. Użytkownik uruchamia aplikację.
2. Przechodzi z intro do widoku głównego.
3. Otwiera zakładkę „Ścieżka” lub „Mapa”.
4. Wybiera interesujące miejsce.
5. Czyta opis, ogląda materiały i odsłuchuje treści.
6. W razie potrzeby uruchamia nawigację do miejsca.

### 6.2. Spacer sekwencyjny po szlaku

1. Użytkownik wybiera moduł „Ścieżka”.
2. Otwiera podgląd wybranego punktu lub rozpoczyna trasę od pierwszego punktu.
3. Aplikacja prowadzi go do kolejnych lokalizacji.
4. Po dotarciu do punktu otwierany jest widok szczegółowy.
5. Po zamknięciu detalu użytkownik przechodzi do kolejnego punktu.

### 6.3. Lektura biograficzna i interpretacyjna

1. Użytkownik wybiera „Życiorys” lub „Wiersze”.
2. Przegląda biografię, oś czasu, bibliotekę i odsłuch.
3. W module wierszy otwiera konkretny utwór.
4. Włącza interpretacje lub przechodzi do sieci adnotacji.

### 6.4. Generowanie nowego wiersza

1. Użytkownik wybiera „Maszyna do wierszy”.
2. Uruchamia generowanie.
3. Obserwuje tekst pojawiający się strumieniowo.
4. Po zakończeniu odtwarza wygenerowane czytanie albo korzysta z syntezy mowy.

### 6.5. Eksploracja analityczna korpusu

1. Użytkownik wybiera „Eksploracja”.
2. Przełącza tryb „cała twórczość” albo „pojedynczy wiersz”.
3. Wybiera kategorię analizy.
4. Otwiera konkretną wizualizację.
5. W trybie wiersza wybiera utwór do analizy.

## 7. Opis modułów funkcjonalnych

### 7.1. Intro

Funkcja modułu:

- prezentacja nazwy projektu i tonu doświadczenia,
- jednorazowe wejście do aplikacji.

Zachowanie:

- ekran pokazuje nazwisko poety, daty życia i cytat,
- użytkownik przechodzi dalej przyciskiem wejścia.

### 7.2. Widok „Ślady” / opis główny

Funkcja modułu:

- wprowadzenie użytkownika w temat aplikacji,
- budowanie nastroju i kontekstu miejskiego,
- wejście do spaceru.

Zawartość:

- esejowy, scrollowany opis,
- fotografie Mikołowa i poety,
- przełącznik „Opis / Ścieżka”.

Wersja referencyjna wskazuje 7 miejsc szlaku.

### 7.3. Moduł „Ścieżka”

Funkcja modułu:

- prowadzenie użytkownika przez trasę spacerową,
- pokazanie kolejności punktów,
- uruchamianie podglądu i przejścia do nawigacji.

Elementy:

- mapa z zaznaczoną linią trasy,
- lista punktów w kolejności,
- podgląd miejsca w dolnym panelu,
- przycisk „Rozpocznij”.

Reguły:

- rozpoczęcie ścieżki zawsze startuje od pierwszego punktu,
- użytkownik może też wybrać dowolny punkt z listy i rozpocząć trasę od niego.

### 7.4. Mapa

Funkcja modułu:

- przegląd wszystkich miejsc na jednej mapie,
- szybkie wejście w szczegół danego punktu.

Elementy:

- markery numerowane,
- linia łącząca punkty,
- dolna karta aktywnego miejsca po kliknięciu w marker.

Reguły:

- kliknięcie w marker centruje mapę na punkcie i otwiera kartę,
- kliknięcie w kartę otwiera pełny detal miejsca,
- kliknięcie w tło mapy zamyka kartę.

### 7.5. Karta miejsca

Funkcja modułu:

- prezentacja pełnej historii jednego punktu.

Zawartość:

- minimapa,
- zdjęcie główne,
- czas zwiedzania,
- liczba zasobów,
- kategoria i opis,
- odtwarzacz audio,
- sekwencja bloków multimedialnych,
- lista miejsc powiązanych.

Obsługiwane typy bloków treści:

- tekst,
- zdjęcie,
- galeria zdjęć,
- audio,
- wideo,
- mapa,
- porównanie „przed / po”,
- oś czasu,
- cytat / wiersz.

Reguły:

- po zamknięciu detalu w zwykłym trybie użytkownik wraca do listy,
- po zamknięciu detalu w trakcie aktywnej ścieżki użytkownik przechodzi do kolejnego punktu,
- po ostatnim punkcie ścieżka kończy się i użytkownik wraca do listy.

### 7.6. Nawigacja terenowa

Funkcja modułu:

- doprowadzenie użytkownika do wybranego miejsca w terenie.

Zachowanie:

- moduł śledzi pozycję użytkownika,
- pokazuje dystans do celu,
- po osiągnięciu progu bliskości odblokowuje wejście do punktu.

Reguły:

- próg uznania, że użytkownik dotarł na miejsce, wynosi 50 metrów,
- gdy użytkownik znajdzie się w zasięgu, może otworzyć punkt ręcznie albo zostaje on przejęty przez logikę spaceru,
- jeśli brak konfiguracji mapy 3D, aplikacja pokazuje prosty ekran awaryjny z linkiem do Google Maps dla trasy pieszej.

Wymagania użytkowe:

- dostęp do lokalizacji urządzenia,
- dla pełnej wersji nawigacji wymagana konfiguracja Mapbox.

### 7.7. Tryb AR

Funkcja modułu:

- wyświetlenie poetyckiej warstwy „na miejscu”, z użyciem kamery, lokalizacji i orientacji telefonu.

Aktualny zakres:

- tryb AR jest skonfigurowany tylko dla tych punktów, które mają zdefiniowane doświadczenie AR,
- w obecnym stanie danych referencyjnych dotyczy to jednego miejsca: domu rodzinnego.

Zachowanie:

- użytkownik uruchamia kamerę,
- aplikacja sprawdza pozycję i ustawienie telefonu,
- po spełnieniu warunków tekst zaczyna się „składać” i ujawniać.

Reguły:

- domyślny promień aktywacji wynosi 75 metrów, ale punkt może nadpisać tę wartość,
- dla domu rodzinnego ustawiono promień 80 metrów,
- dodatkowo oceniane jest ustawienie urządzenia względem celu,
- po zablokowaniu celu tekst odsłania się z krótkim opóźnieniem.

Wymagania użytkowe:

- dostęp do kamery,
- dostęp do lokalizacji,
- dostęp do czujników ruchu / orientacji urządzenia.

### 7.8. Moduł „Życiorys”

Funkcja modułu:

- wieloformatowe opowiedzenie biografii poety.

Moduł zawiera 5 trybów:

| Tryb | Funkcja |
|---|---|
| Czytaj | pełna narracja biograficzna w układzie artykułu |
| Oś czasu | interaktywna chronologia z rozwijanymi punktami |
| Posłuchaj | odsłuch biografii z podświetlaniem zdań |
| Czat | rozmowa z algorytmem stylizowanym na „cień poety” |
| Biblioteka | książki, materiały i linki zewnętrzne |

#### 7.8.1. Tryb „Czytaj”

- prezentuje rozbudowane sekcje biograficzne,
- treść jest podzielona na logiczne rozdziały.

#### 7.8.2. Tryb „Oś czasu”

- pokazuje kluczowe wydarzenia życia,
- każdy punkt można rozwinąć po dodatkowy opis.

#### 7.8.3. Tryb „Posłuchaj”

- wykorzystuje systemową syntezę mowy przeglądarki,
- pozwala odtwarzać biografię zdanie po zdaniu,
- umożliwia kliknięcie konkretnego zdania i start od tego miejsca,
- pokazuje postęp odsłuchu.

#### 7.8.4. Tryb „Czat”

- umożliwia rozmowę tekstową z modelem AI,
- odpowiedzi są strumieniowane,
- rozmowa ma charakter stylizowany i nie jest prezentowana jako autentyczna wypowiedź poety.

Reguły:

- maksymalna długość rozmowy to 40 wiadomości łącznie,
- po osiągnięciu limitu użytkownik musi odświeżyć stronę, aby zacząć od nowa.

#### 7.8.5. Tryb „Biblioteka”

- prezentuje książki autora,
- prezentuje książki o autorze,
- udostępnia linki do zasobów zewnętrznych.

### 7.9. Moduł „Wiersze”

Funkcja modułu:

- prezentacja utworów poety,
- odsłuch wybranych nagrań,
- przełączanie warstwy interpretacyjnej,
- wejście do pełnych interpretacji sieciowych.

Elementy:

- lista wierszy,
- widok szczegółowy pojedynczego utworu,
- opcjonalny odtwarzacz audio,
- opcjonalna warstwa adnotacji i glosariusza,
- osobna sekcja utworów dostępnych tylko jako interpretacje.

Reguły:

- nie każdy wiersz ma przypisane audio,
- nie każdy wiersz ma pełną interpretację,
- część interpretacji jest dostępna inline, a część przez dedykowany widok sieciowy.

### 7.10. Moduł interpretacji

Funkcja modułu:

- rozczytywanie wierszy warstwa po warstwie,
- powiązanie wersów z siecią adnotacji,
- przechodzenie między węzłami interpretacyjnymi.

Zachowanie:

- użytkownik otwiera wiersz interpretowany,
- rozwija wersy zawierające adnotacje,
- wybiera konkretny węzeł,
- przechodzi do szczegółowej analizy danego motywu,
- może przeskakiwać do powiązań, sprzecznych odczytań i sąsiednich adnotacji.

Źródło treści:

- interpretacje są ładowane ze statycznych plików JSON i buforowane po pierwszym użyciu.

### 7.11. Moduł „Eksploracja”

Funkcja modułu:

- prezentacja ilościowych i jakościowych analiz korpusu poezji Wojaczka.

Zakres referencyjny:

- interfejs komunikuje analizę 310 wierszy.

Tryby:

| Tryb | Funkcja |
|---|---|
| Cała twórczość | analiza zbiorcza korpusu |
| Pojedynczy wiersz | analiza jednego utworu |

Kategorie analiz:

- morfologia,
- składnia,
- fonetyka,
- semantyka,
- podmiot liryczny,
- intertekstualność,
- klimat i nastrój.

Obsługiwane funkcje:

- wybór kategorii i typu analizy,
- wybór pojedynczego wiersza do analizy,
- wizualizacje w formie wykresów, skal, list i histogramów,
- statystyki kontekstowe dla wiersza lub całego korpusu,
- eksplorator zmiennych,
- porównanie z innym wierszem,
- odniesienie do średniej korpusu tam, gdzie przewidziano to w interfejsie.

Moduł pełni funkcję edukacyjną i badawczą.

### 7.12. Moduł „Maszyna do wierszy”

Funkcja modułu:

- generowanie nowych wierszy inspirowanych poetyką Rafała Wojaczka.

Przebieg:

1. użytkownik uruchamia generację,
2. tekst pojawia się strumieniowo, znak po znaku,
3. po zakończeniu aplikacja próbuje wygenerować czytanie audio,
4. użytkownik może wygenerować kolejny utwór.

Reguły:

- obowiązuje limit 10 generacji dziennie na urządzenie / przeglądarkę,
- licznik zapisywany jest lokalnie w przeglądarce i resetuje się każdego dnia,
- moduł próbuje wzbogacić prompt o kontekst chwili: czas, porę roku, lokalizację użytkownika, pogodę i motyw intelektualny,
- jeśli pobranie kontekstu się nie uda, generacja nadal działa,
- jeśli dostępny jest klucz ElevenLabs, powstaje plik audio,
- w przeciwnym razie aplikacja korzysta z systemowej syntezy mowy przeglądarki.

Wymagania użytkowe:

- połączenie z usługą AI,
- opcjonalnie lokalizacja dla wzbogacenia promptu,
- opcjonalnie wsparcie syntezy mowy po stronie przeglądarki.

### 7.13. Moduł „O aplikacji”

Funkcja modułu:

- przekazanie informacji o projekcie,
- prezentacja zespołu i partnerów,
- pokazanie podstawowych danych wersji.

## 8. Zarządzanie treścią

### 8.1. Model treści

System zarządza następującymi obiektami treści:

- miejsce,
- blok mediów miejsca,
- wiersz,
- list,
- obraz galerii,
- wydarzenie osi czasu,
- plik audio,
- ustawienia serwisu.

### 8.2. Edycja miejsca

Miejsce zawiera:

- tytuł,
- kategorię,
- współrzędne,
- opis,
- obraz główny,
- czas zwiedzania,
- liczbę zasobów,
- kolejność na szlaku,
- zestaw bloków mediów.

### 8.3. Edycja bloków mediów

Panel administracyjny posiada uproszczony formularz do edycji bloków mediów. Redaktor nie pracuje wyłącznie na surowym JSON-ie, lecz na polach dopasowanych do typu bloku.

Dzięki temu możliwe jest redakcyjne utrzymanie:

- tekstów,
- zdjęć,
- audio,
- wideo,
- galerii,
- cytatów / wierszy,
- map,
- osi czasu,
- bloków „przed / po”.

## 9. Reguły działania i ograniczenia

### 9.1. Ładowanie danych

- jeśli skonfigurowano adres API, aplikacja pobiera dane z backendu,
- jeśli adres API nie jest ustawiony, aplikacja działa na danych zaszytych po stronie frontendu,
- jeśli pobieranie danych z API zakończy się błędem, aplikacja przełącza się na dane lokalne.

To oznacza, że aplikacja ma zaprojektowany tryb awaryjny i demonstracyjny.

### 9.2. Zapamiętywanie stanu

- aktualny widok aplikacji jest zapisywany w `sessionStorage`,
- licznik dziennych generacji wierszy jest zapisywany w `localStorage`.

### 9.3. Uprawnienia urządzenia

Wybrane funkcje wymagają zgód użytkownika:

- lokalizacja: nawigacja, AR, wzbogacanie promptu generatora,
- kamera: AR,
- czujniki ruchu / orientacji: AR,
- audio / synteza mowy: odsłuch i czytanie.

### 9.4. Funkcje AI

W systemie występują trzy typy funkcji AI:

- czat stylizowany na „cień poety”,
- generator nowych wierszy,
- dodatkowe moduły obrazowe przygotowane w kodzie.

Ważne ograniczenia:

- czat i generator zależą od zewnętrznych usług modelowych,
- część funkcji obrazowych istnieje w kodzie, ale nie jest obecnie eksponowana w głównym UI,
- interfejs biograficzny i interpretacyjny jasno komunikuje edukacyjny / stylizowany charakter treści AI.

### 9.5. Tryb offline i PWA

Aplikacja posiada manifest i service worker, jednak aktualna logika startowa czyści wcześniejsze rejestracje i cache przy uruchomieniu strony. W praktyce nie należy traktować stabilnego trybu offline jako gwarantowanej funkcji biznesowej tej wersji.

## 10. Integracje zewnętrzne

### 10.1. Usługi treści i modeli

- Anthropic: czat i generator wierszy,
- ElevenLabs: generowanie czytania audio wygenerowanych wierszy,
- systemowa synteza mowy przeglądarki: fallback audio,
- Open-Meteo: pogoda do kontekstu generatora.

### 10.2. Mapy i geolokalizacja

- Leaflet: mapa punktów i ścieżki,
- Mapbox: nawigacja 3D w terenie,
- Google Maps: fallback linku zewnętrznego do prowadzenia pieszo.

## 11. API i warstwa danych

Backend udostępnia endpointy do pobrania:

- miejsc,
- wierszy,
- listów,
- galerii,
- osi czasu,
- plików audio,
- ustawień mapy.

Te zasoby są przeznaczone głównie do zasilania aplikacji frontendowej oraz obsługi redakcyjnej treści.

## 12. Aktualny zakres produktu a funkcje ukryte

Z punktu widzenia bieżącego użytkownika końcowego najważniejsze i w pełni prowadzone przez interfejs są:

- intro,
- ślady,
- ścieżka,
- mapa,
- detal miejsca,
- nawigacja,
- pojedynczy tryb AR,
- życiorys,
- wiersze,
- eksploracja,
- maszyna do wierszy,
- strona „O aplikacji”.

Dodatkowo w bazie kodu istnieją funkcje, które wyglądają na przygotowane do dalszego rozwoju lub testów:

- osobna galeria,
- osobne listy,
- osobne refleksje AI,
- mockupy AI,
- oddzielny ekran interpretacji dostępny technicznie niezależnie od listy wierszy.

## 13. Podsumowanie

„Śladami Wojaczka” jest aplikacją narracyjno-edukacyjną o charakterze mobilnym i immersyjnym. Jej rdzeń funkcjonalny stanowią:

- zwiedzanie miejsc powiązanych z poetą,
- opowieść biograficzna w wielu trybach,
- lektura i interpretacja poezji,
- eksploracja analityczna korpusu,
- twórcza interakcja z AI.

Produkt jest gotowy do użycia jako przewodnik i narzędzie edukacyjne, a jednocześnie zawiera widoczne punkty rozwojowe: rozszerzenie AR, pełniejsze wystawienie modułów pomocniczych i uporządkowanie trybu offline.
