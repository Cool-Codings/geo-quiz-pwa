# Geo-Quiz

Eine Lern-PWA für Kinder (7-12 Jahre) zum Üben von Ländern und Hauptstädten.

## Aktueller Stand

Erster spielbarer Modus: **Hauptstädte-Quiz**

- Multiple-Choice mit 4 Antwortoptionen, Distraktoren wechseln bei jedem Durchlauf
- 3 Schwierigkeitsstufen (leicht, mittel, schwer), ca. 60 Länder weltweit
- Zeitlimit pro Frage je nach Schwierigkeit (15 / 12 / 10 Sekunden)
- Punktesystem mit Highscore in `localStorage`
- Levelfortschritt: nächste Stufe wird ab 70% Trefferquote freigeschaltet
- PWA-Grundgerüst mit Manifest und Service Worker für Offline-Nutzung

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
data/countries.json   Länder + Hauptstädte je Schwierigkeitsstufe
manifest.json         PWA-Manifest
sw.js                 Service Worker (Offline-Caching)
icons/                App-Icons (SVG)
```
