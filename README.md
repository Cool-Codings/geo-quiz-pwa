# Geo-Quiz

Eine Lern-PWA für Kinder (7-12 Jahre) zum Üben von Ländern und Hauptstädten.
**Version 1.0** — alle geplanten Features sind umgesetzt.

## Aktueller Stand

Elf spielbare Modi, wählbar auf dem Start-Bildschirm, sowie ein lokaler
2-Spieler-Duell-Modus (siehe eigener Abschnitt unten):

- **Hauptstädte**: "Wie heißt die Hauptstadt von [Land]?"
- **Länder**: mischt beide Richtungen — Land→Hauptstadt und Hauptstadt→Land
- **Städte**: "Welche ist die größte Stadt in [Land]?" (größte Stadt ≠ Hauptstadt bei vielen Ländern, z. B. Schweiz/Zürich, Türkei/Istanbul). Alle 4 Antwortoptionen stammen aus demselben Land (`cities`-Feld in `countries.json`, 4-5 bekannte Städte je Land) — es werden nie Städte verschiedener Länder gemischt. Länder ohne ausreichend bekannte Städte (z. B. Bhutan, Mongolei) tauchen in diesem Modus nicht auf.
- **Flüsse**: "Durch welches Land fließt [Fluss]?" (nur für Länder mit bekanntem großen Fluss)
- **Flaggen**: Flagge wird angezeigt, Antwortoptionen sind Ländernamen
- **Karte**: interaktive Weltkarte statt Multiple-Choice-Buttons, mit zwei Untermodi
  ("Länder finden" / "Städte finden"), siehe eigener Abschnitt unten
- **Umrisse**: isolierter Länder-Umriss statt Text/Flagge, siehe eigener Abschnitt unten
- **Nachbarn**: "Welches Land grenzt an [Land]?", siehe eigener Abschnitt unten
- **Kontinente**: Drag & Drop statt Multiple-Choice, siehe eigener Abschnitt unten
- **Puzzle**: entspanntes Kontinente-Weltkarten-Puzzle, siehe eigener Abschnitt unten

Gemeinsame Spiellogik aller Modi:

- Multiple-Choice mit 4 Antwortoptionen, Distraktoren aus derselben Schwierigkeitsstufe, wechseln bei jedem Durchlauf
- Antwort-Kacheln sind vor der Antwort neutral eingefärbt (Blau/Lila/Orange/Gelb) — Rot und Grün sind ausschließlich für das Feedback nach der Antwort reserviert: die richtige Kachel blinkt kurz grün auf, eine falsch angeklickte Kachel kurz rot
- 3 Schwierigkeitsstufen (leicht, mittel, schwer), 60 Länder weltweit
- Zeitlimit pro Frage je nach Schwierigkeit (15 / 12 / 10 Sekunden)
- Punktesystem mit **pro Modus eigenem** Highscore in `localStorage`
- Levelfortschritt: nächste Stufe wird ab 70% Trefferquote freigeschaltet — **pro Modus unabhängig**
- PWA-Grundgerüst mit Manifest und Service Worker für Offline-Nutzung (inkl. aller Flaggen-SVGs)

Die Flaggen-Grafiken (`assets/flags/*.svg`) stammen aus dem Open-Source-Projekt
[flag-icons](https://github.com/lipis/flag-icons) (MIT-Lizenz), siehe
`assets/flags/SOURCE.md` und `assets/flags/LICENSE-flag-icons.txt`.

**Maskottchen (Koala)**: begleitet auf allen drei Bildschirmen mit eigenen SVG-Posen
(`assets/mascot/`):

- Start-Bildschirm: tageszeitabhängige, zufällige Begrüßung in einer Sprechblase
- Quiz-Bildschirm: reagiert nach jeder Antwort mit Pose + zufälligem Spruch aus
  einem Pool positiver Formulierungen (bei falschen Antworten immer aufmunternd,
  nie negativ)
- Ergebnis-Bildschirm: Pose und Spruch richten sich nach der erreichten Quote
  (≥90% "excited", ≥50% "happy", darunter tröstend-motivierendes "comfort")

**Tages-Streak**: `localStorage` merkt sich, an wie vielen Tagen in Folge gespielt
wurde (bricht bei einer ausgelassenen Tageslücke ab), sichtbar als Badge auf dem
Start-Bildschirm. Bei Erreichen eines Meilensteins (3/7/14/30 Tage) gibt es auf
dem Ergebnis-Bildschirm eine Konfetti-Animation und eine besonders freudige
Koala-Pose.

**Karte-Modus** (`assets/map/world-map.svg`): eine statisch generierte
Weltkarten-SVG (Equirectangular-Projektion, 60 einzeln anklickbare Länder-Pfade
mit `id="<ISO-3166-1-alpha-2-Code>"`) ohne jegliche Beschriftung — komplett
lokal, kein externer Kartendienst.

- **Länder finden**: Klick muss den Pfad des gefragten Landes treffen.
- **Städte finden**: Hauptstädte und größte Städte aus `countries.json`
  (`capitalCoords`/`largestCityCoords`) werden auf die Karte projiziert; ein
  Klick zählt als richtig, wenn er innerhalb eines Toleranz-Radius um die
  echten Koordinaten liegt.
- **Kontinent-Zoom**: Beim Start jeder Karten-Frage zoomt/zentriert die Karte
  automatisch auf den Kontinent der gesuchten Antwort (`continent`-Feld in
  `countries.json`), damit Länder größer und leichter anklickbar sind.
- **Nur mittelgroße/große Länder**: Mikrostaaten (z. B. Liechtenstein) sind
  über ein aus der echten Kartenfläche berechnetes `mapEligible`-Feld aus dem
  Karten-Modus ausgeschlossen (bleiben in den anderen Modi weiterhin nutzbar).
  Für alle verbleibenden Länder sorgt zusätzlich ein bildschirmpixel-basierter
  Toleranz-Radius um den Mittelpunkt dafür, dass auch kleinere Formen
  zuverlässig antippbar bleiben.
- **Zoom/Pan**: Zwei-Finger-Pinch-Zoom auf Touch-Geräten, +/- Buttons für die
  Maus-Bedienung, sowie Verschieben (Pan) bei vergrößerter Ansicht — mit
  Tap-/Drag-Unterscheidung, damit Verschieben keine (Fehl-)Antwort auslöst.
- Richtige Antwort: Land/Stadt-Punkt wird kurz grün markiert. Falsche Antwort:
  die tatsächlich gemeinte Stelle wird rot markiert, der eigene Tipp als
  kleiner grauer Punkt.
- Beide Untermodi nutzen dieselbe Zeit-/Score-/Highscore-Logik wie die
  anderen Modi und führen komplett unabhängige Highscores und
  Freischalt-Fortschritte.

Die Karte wurde aus dem [world-atlas](https://github.com/topojson/world-atlas)-
TopoJSON-Datensatz (Natural-Earth-Daten, gemeinfrei) generiert — Details und
Lizenz in `assets/map/SOURCE.md`.

**Herzen-System**: 3 Herzen, global über alle Modi hinweg in `localStorage`
gespeichert (nicht pro Runde zurückgesetzt). Jede falsche Antwort kostet ein
Herz; bei 0 Herzen endet die laufende Runde vorzeitig mit dem bisherigen Score
und einer tröstenden Koala-Reaktion. Herzen regenerieren sich zeitgesteuert
(1 Herz alle 30 Minuten, per Zeitstempel-Anker berechnet) — funktioniert auch
offline, da rein clientseitig.

**Koala-Sammlung**: 4 freischaltbare Skins (Hut, Sonnenbrille, Schal, Krone)
als Overlay-SVGs (`assets/mascot/accessories/`), die über allen vier
Koala-Posen sitzen. Freischaltung anhand persistenter Lifetime-Statistiken
(gespielte Runden, Gesamtpunktzahl über alle Modi, bester je erreichter
Streak). Auf dem Start-Bildschirm wählbar; gesperrte Skins erscheinen
ausgegraut mit Schloss-Symbol und Freischalt-Hinweis.

**Umrisse-Modus**: zeigt nur die isolierte, zentrierte Silhouette eines
Landes — technisch dieselben Länder-Pfade wie im Karte-Modus
(`assets/map/world-map.svg`), nur auf eine Bounding-Box um das gesuchte Land
gezoomt, alle anderen Länder-Pfade transparent geschaltet. Antwort per
Multiple-Choice mit 4 Ländernamen wie bei den Text-Modi (Zeitlimit, Scoring,
eigener Highscore, gleiche Distraktor-Logik). Nur `mapEligible`-Länder
stehen zur Auswahl, da nur diese eine für dieses Format brauchbar präzise
Kartenform besitzen.

**Nachbarn-Modus**: "Welches Land grenzt an [Land]?" mit 4 Ländernamen zur
Auswahl, davon genau ein echter Landnachbar (keine Wassergrenzen). Jedes
Land in `countries.json` hat dafür ein `neighbors`-Array mit den
ISO-3166-1-alpha-2-Codes seiner echten Nachbarländer, beschränkt auf
Nachbarn, die auch im 60-Länder-Datensatz vorkommen. Die drei Distraktoren
werden so gewählt, dass sie selbst keine echten Nachbarn des gefragten
Landes sind — es gibt also immer genau eine richtige Antwort. Länder ohne
Nachbarn im Datensatz (z. B. Inselstaaten wie Japan oder Sri Lanka) tauchen
in diesem Modus nicht als Frage auf.

**Kontinente-Zuordnung**: statt Multiple-Choice wird ein Länderchip per
Drag & Drop (Pointer Events, funktioniert mit Maus und Touch) auf eine von
6 beschrifteten Kontinent-Zonen gezogen. Kein Zeitlimit — bei einer falschen
Zuordnung springt der Chip zurück, der Koala gibt einen aufmunternden
Hinweis, und dasselbe Land kann beliebig oft erneut versucht werden. Punkte
gibt es nur für richtige Zuordnungen (volle Punktzahl beim ersten Versuch,
reduzierte Punktzahl bei einem späteren Versuch); für die
Freischalt-Fortschritt-Schwelle zählt nur die Erstversuch-Trefferquote.
Nutzt ansonsten dieselbe Highscore-/Freischalt-Infrastruktur wie die
anderen Modi.

**Puzzle-Modus** (🧩, rein explorativ, kein Punktesystem): eine stark
vereinfachte Weltkarte aus 6 großen, proportional zueinander platzierten
Kontinent-Teilen (abgeleitet aus denselben `CONTINENT_REGIONS`, die auch der
Karte-Modus für den Kontinent-Zoom nutzt), die per Drag & Drop auf eine
leere, gestrichelte Umriss-Vorlage gezogen werden. Bei ausreichender Nähe
zur richtigen Position (großzügiger Toleranz-Radius) rastet ein Teil fest
ein. Die Zeit wird gestoppt; nach Abschluss aller 6 Teile zeigt ein
Erfolgs-Bildschirm mit Koala-Konfetti-Feier die benötigte Zeit und
aktualisiert bei Bedarf die in `localStorage` gespeicherte Bestzeit
(`geoquiz-puzzle-besttime`). Es gibt keine Schwierigkeitsstufen und kein
Zeitlimit — nur ein einziges, immer gleiches Puzzle zum entspannten Üben.

**Duell-Modus** (⚔️, lokales 2-Spieler-Hot-Seat-Spiel am selben Gerät, kein
Internet/Server nötig):

- Eigene Kachel "Duell" auf dem Start-Bildschirm führt zu einem Einrichtungs-
  Bildschirm: Namen für Spieler 1/2 eintragen (Vorgabe "Spieler 1"/"Spieler 2",
  überschreibbar), dann Modus (alle Quiz-/Karten-Modi mit Multiple-Choice
  stehen zur Auswahl) und Schwierigkeit wählen — beide Spieler bekommen
  denselben Modus und dieselbe Schwierigkeit.
- Spieler 1 spielt eine komplette Runde (10 Fragen) mit dem regulären
  Quiz-Bildschirm. Die Fragen (inkl. Reihenfolge und Distraktoren) werden
  einmalig erzeugt und für beide Spieler unverändert wiederverwendet, damit
  der Vergleich fair ist.
- Danach erscheint ein Übergabe-Bildschirm ("Gib das Gerät an Spieler 2
  weiter!") mit Bestätigungs-Button, bevor Spieler 2 dieselbe Fragenrunde
  spielt.
- Gemeinsamer Ergebnis-Bildschirm zeigt beide Punktzahlen nebeneinander und
  hebt den Gewinner hervor (🏆); bei Gleichstand "Unentschieden!". Der Koala
  reagiert passend: freudig für den Gewinner, aufmunternd für den Verlierer,
  bei einem Unentschieden lobt er beide.
- Der Duell-Modus teilt sich den Quiz-Bildschirm mit dem Solo-Spiel, greift
  aber **nicht** in Solo-Highscores, Streak, Herzen oder Lifetime-Statistiken
  ein — diese bleiben unverändert, unabhängig davon, wie oft und wie
  erfolgreich ein Duell gespielt wird. Kontinente-Zuordnung und Puzzle stehen
  im Duell-Modus (noch) nicht zur Auswahl, da sie kein Zeitlimit/Punkte-pro-
  Frage-Format nutzen.

**Mehrsprachigkeit** (🇩🇪 Deutsch / 🇬🇧 English / 🇮🇹 Italiano): über das
Zahnrad-Symbol auf dem Start-Bildschirm erreichbar. Alle UI-Texte, Fragen-
Formulierungen, Koala-Sprüche, Ergebnis-Meldungen und Fehlermeldungen liegen
als Übersetzungs-Wörterbuch in `js/i18n.js` (`I18N`-Objekt, drei Sprachen,
`t(key, vars)`-Hilfsfunktion mit `{platzhalter}`-Ersetzung). Länder-,
Hauptstadt-, Stadt- und Flussnamen werden pro Sprache in `countries.json`
gepflegt (`country_en`/`country_it` usw. neben den deutschen Basisfeldern,
mit Fallback auf Deutsch wenn eine Übersetzung fehlt) und über
`localizedField()` konsistent in allen Modi verwendet — Multiple-Choice-
Distraktoren, Antwort-Abgleich und angezeigter Text nutzen dieselbe Sprache.
Die gewählte Sprache wird in `localStorage` gespeichert und bleibt nach
Neuladen erhalten; Standardsprache beim ersten Start ist Deutsch.

**Passwortschutz**: Beim Laden erscheint ein Modal mit Passwortabfrage
(Standard-Passwort im Code leicht obfuskiert als Zeichencode-Array, kein
echtes Backend — reicht für Familien-/Freundeskreis-Nutzung, analog zur
Schwester-PWA). Eine "Passwort merken"-Checkbox speichert einen erfolgreichen
Login in `localStorage`, sodass das Passwort nicht bei jedem Öffnen erneut
eingegeben werden muss.

**Design & Übergänge**: Alle Bildschirme nutzen durchgängig dieselben
`.card`/`.btn-primary`/`.btn-secondary`-Bausteine und Farbvariablen; beim
Ausbau der elf Modi entstandene Inkonsistenzen (z. B. abweichende
Kachel-Beschriftungen für den Karte-Modus im Duell-Setup) wurden
vereinheitlicht. Ein sanfter Fade-/Slide-Übergang (`@keyframes
screen-fade-in`) läuft beim Wechsel zwischen Bildschirmen automatisch mit,
respektiert aber `prefers-reduced-motion`.

**App-Icons**: rundes, farbenfrohes Icon-Set im Illustrationsstil des Koala-
Maskottchens (Koala-Kopf vor einem Globus, `icons/icon.svg` +
`icons/icon-maskable.svg` als Quellen, dazu vorgerenderte PNGs in 180/192/512 px
für iOS-Homescreen, Android und Standard-Manifest-Icons).

## Noch nicht umgesetzt

Keine offenen Punkte aus der ursprünglichen Planung — mögliche zukünftige
Ideen (nicht Teil von Version 1.0): weitere Sprachen, zusätzliche Länder/
Regionen, Online-Mehrspieler.

## Lokal starten

Da die App per `fetch` auf `data/countries.json` zugreift, muss sie über einen
lokalen Webserver ausgeliefert werden (nicht per `file://` öffnen):

```bash
npx serve .
# oder
python3 -m http.server 8080
```

Danach im Browser `http://localhost:8080` (bzw. den entsprechenden Port) öffnen.

## Projektstruktur

```
index.html          Grundgerüst mit Start-, Quiz-, Ergebnis-, Puzzle-, Duell-Bildschirmen + Einstellungs-/Passwort-Modals
css/style.css        Kindgerechtes, buntes Design, Screen-Übergänge
js/i18n.js            Übersetzungs-Wörterbuch (DE/EN/IT) + t()/tList()/localizedField()-Hilfsfunktionen
js/app.js             Spiellogik (Fragen, Timer, Scoring, Fortschritt, Maskottchen, Streak, Karte, Herzen, Skins, Umrisse, Nachbarn, Kontinente-Drag&Drop, Puzzle, Duell-Modus, Sprachumschaltung, Passwortschutz)
data/countries.json   Länder, Hauptstädte, größte Städte, Flüsse, Koordinaten, Kontinent, Flächenfilter, Nachbarländer je Land (+ EN/IT-Übersetzungen)
manifest.json         PWA-Manifest
sw.js                 Service Worker (Offline-Caching, inkl. Flaggen, Maskottchen, Accessoires, Weltkarte und App-Icons)
icons/                App-Icons: Koala-vor-Globus-Motiv (SVG-Quellen + vorgerenderte PNGs)
assets/flags/          Flaggen-SVGs (flag-icons, MIT-Lizenz)
assets/mascot/          Koala-Maskottchen in 4 Posen (SVG, eigene Illustration)
assets/mascot/accessories/  Freischaltbare Skin-Overlays (Hut, Sonnenbrille, Schal, Krone)
assets/map/             Weltkarten-SVG (world-atlas/Natural-Earth-Daten, ISC/gemeinfrei)
```
