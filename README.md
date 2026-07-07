# Geo-Quiz

Eine Lern-PWA für Kinder (7-12 Jahre) zum Üben von Ländern und Hauptstädten.

## Aktueller Stand

Fünf spielbare Quiz-Modi, wählbar auf dem Start-Bildschirm:

- **Hauptstädte**: "Wie heißt die Hauptstadt von [Land]?"
- **Länder**: mischt beide Richtungen — Land→Hauptstadt und Hauptstadt→Land
- **Städte**: "Welche ist die größte Stadt in [Land]?" (größte Stadt ≠ Hauptstadt bei vielen Ländern, z. B. Schweiz/Zürich, Türkei/Istanbul)
- **Flüsse**: "Durch welches Land fließt [Fluss]?" (nur für Länder mit bekanntem großen Fluss)
- **Flaggen**: Flagge wird angezeigt, Antwortoptionen sind Ländernamen

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

Noch nicht umgesetzt: Maskottchen, Streak-/Herzen-System, Mehrsprachigkeit.

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
js/app.js             Spiellogik (Fragen, Timer, Scoring, Fortschritt)
data/countries.json   Länder, Hauptstädte, größte Städte, Flüsse, Ländercodes je Schwierigkeitsstufe
manifest.json         PWA-Manifest
sw.js                 Service Worker (Offline-Caching, inkl. Flaggen)
icons/                App-Icons (SVG)
assets/flags/          Flaggen-SVGs (flag-icons, MIT-Lizenz)
```
