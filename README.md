# Geo-Quiz

Eine Lern-PWA für Kinder (7-12 Jahre) zum Üben von Ländern und Hauptstädten.

## Aktueller Stand

Sechs spielbare Quiz-Modi, wählbar auf dem Start-Bildschirm:

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

- **Länder finden**: Klick muss den Pfad des gefragten Landes treffen. Sehr
  kleine Länder (z. B. Liechtenstein) bekommen zusätzlich einen
  Toleranz-Radius um ihren Mittelpunkt, damit sie auf dem Handy zuverlässig
  antippbar bleiben.
- **Städte finden**: Hauptstädte und größte Städte aus `countries.json`
  (`capitalCoords`/`largestCityCoords`) werden auf die Karte projiziert; ein
  Klick zählt als richtig, wenn er innerhalb eines Toleranz-Radius um die
  echten Koordinaten liegt.
- Der Toleranz-Radius wird in Bildschirm-Pixeln (nicht in SVG-Koordinaten)
  berechnet, damit er unabhängig von der tatsächlichen Kartengröße immer
  komfortabel antippbar bleibt (statt echtem Pinch-Zoom — siehe Hinweis unten).
- Richtige Antwort: Land/Stadt-Punkt wird kurz grün markiert. Falsche Antwort:
  die tatsächlich gemeinte Stelle wird rot markiert, der eigene Tipp als
  kleiner grauer Punkt.
- Beide Untermodi nutzen dieselbe Zeit-/Score-/Highscore-Logik wie die
  anderen Modi und führen komplett unabhängige Highscores und
  Freischalt-Fortschritte.

Die Karte wurde aus dem [world-atlas](https://github.com/topojson/world-atlas)-
TopoJSON-Datensatz (Natural-Earth-Daten, gemeinfrei) generiert — Details und
Lizenz in `assets/map/SOURCE.md`. Statt echtem Pinch-Zoom/Pan setzt der Modus
bewusst auf eine großzügige, bildschirmgrößen-unabhängige Antipp-Toleranz
(im Auftrag ausdrücklich als Alternative vorgesehen).

Noch nicht umgesetzt: Herzen-System, Belohnungs-Skins für den Koala,
Mehrsprachigkeit, 2-Spieler-Modus, Kontinente-Zuordnung, Puzzle-Modus.

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
index.html          Grundgerüst mit Start-, Quiz- und Ergebnis-Bildschirm
css/style.css        Kindgerechtes, buntes Design
js/app.js             Spiellogik (Fragen, Timer, Scoring, Fortschritt, Maskottchen, Streak, Karte)
data/countries.json   Länder, Hauptstädte, größte Städte, Flüsse, Koordinaten, Ländercodes je Schwierigkeitsstufe
manifest.json         PWA-Manifest
sw.js                 Service Worker (Offline-Caching, inkl. Flaggen, Maskottchen und Weltkarte)
icons/                App-Icons (SVG)
assets/flags/          Flaggen-SVGs (flag-icons, MIT-Lizenz)
assets/mascot/          Koala-Maskottchen in 4 Posen (SVG, eigene Illustration)
assets/map/             Weltkarten-SVG (world-atlas/Natural-Earth-Daten, ISC/gemeinfrei)
```
