# Geo-Quiz

Eine Lern-PWA für Kinder (7-12 Jahre) zum Üben von Ländern und Hauptstädten.

## Aktueller Stand

Sieben spielbare Quiz-Modi, wählbar auf dem Start-Bildschirm, sowie ein
lokaler 2-Spieler-Duell-Modus (siehe eigener Abschnitt unten):

- **Hauptstädte**: "Wie heißt die Hauptstadt von [Land]?"
- **Länder**: mischt beide Richtungen — Land→Hauptstadt und Hauptstadt→Land
- **Städte**: "Welche ist die größte Stadt in [Land]?" (größte Stadt ≠ Hauptstadt bei vielen Ländern, z. B. Schweiz/Zürich, Türkei/Istanbul)
- **Flüsse**: "Durch welches Land fließt [Fluss]?" (nur für Länder mit bekanntem großen Fluss)
- **Flaggen**: Flagge wird angezeigt, Antwortoptionen sind Ländernamen
- **Karte**: interaktive Weltkarte statt Multiple-Choice-Buttons, mit zwei Untermodi
  ("Länder finden" / "Städte finden"), siehe eigener Abschnitt unten

Gemeinsame Spiellogik aller Modi:

- Multiple-Choice mit 4 Antwortoptionen, Distraktoren aus derselben Schwierigkeitsstufe, wechseln bei jedem Durchlauf
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

**Duell-Modus** (⚔️, lokales 2-Spieler-Hot-Seat-Spiel am selben Gerät, kein
Internet/Server nötig):

- Eigene Kachel "Duell" auf dem Start-Bildschirm führt zu einem Einrichtungs-
  Bildschirm: Namen für Spieler 1/2 eintragen (Vorgabe "Spieler 1"/"Spieler 2",
  überschreibbar), dann Modus (alle sieben Quiz-/Karten-Modi stehen zur
  Auswahl) und Schwierigkeit wählen — beide Spieler bekommen denselben Modus
  und dieselbe Schwierigkeit.
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
  erfolgreich ein Duell gespielt wird.

Noch nicht umgesetzt: Mehrsprachigkeit, Kontinente-Zuordnung-Modus,
Puzzle-Modus, Länder-Umriss-Rätsel, Nachbarländer-Spiel.

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
index.html          Grundgerüst mit Start-, Quiz-, Ergebnis- und Duell-Bildschirmen
css/style.css        Kindgerechtes, buntes Design
js/app.js             Spiellogik (Fragen, Timer, Scoring, Fortschritt, Maskottchen, Streak, Karte, Herzen, Skins, Duell-Modus)
data/countries.json   Länder, Hauptstädte, größte Städte, Flüsse, Koordinaten, Kontinent, Flächenfilter je Land
manifest.json         PWA-Manifest
sw.js                 Service Worker (Offline-Caching, inkl. Flaggen, Maskottchen, Accessoires und Weltkarte)
icons/                App-Icons (SVG)
assets/flags/          Flaggen-SVGs (flag-icons, MIT-Lizenz)
assets/mascot/          Koala-Maskottchen in 4 Posen (SVG, eigene Illustration)
assets/mascot/accessories/  Freischaltbare Skin-Overlays (Hut, Sonnenbrille, Schal, Krone)
assets/map/             Weltkarten-SVG (world-atlas/Natural-Earth-Daten, ISC/gemeinfrei)
```
