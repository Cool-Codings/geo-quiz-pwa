# Weltkarten-Quelle

`world-map.svg` wurde aus dem [world-atlas](https://github.com/topojson/world-atlas)
TopoJSON-Datensatz (`countries-50m.json`, ISC-Lizenz, basierend auf
[Natural Earth](https://www.naturalearthdata.com/) — gemeinfreie Daten)
generiert:

1. TopoJSON mit [topojson-client](https://github.com/topojson/topojson-client)
   zu GeoJSON konvertiert.
2. Jedes Land mit einer einfachen Plattkarten-Projektion (Equirectangular:
   `x = (lon+180)/360 * 960`, `y = (90-lat)/180 * 480`) zu SVG-Pfaden gerendert
   (eigenes kleines Node-Skript, kein d3-geo zur Laufzeit nötig).
3. Länder-Pfade unserer 60 Quiz-Länder bekommen `id="<ISO-3166-1-alpha-2-Code>"`
   (per Namensabgleich mit `data/countries.json` zugeordnet, nicht per
   auswendig gelernter Nummern) sowie `data-cx`/`data-cy`/`data-tol` für den
   Toleranz-Radius beim Antippen kleiner Länder (z. B. Liechtenstein).
4. Koordinaten auf ganze Pixel gerundet und doppelte Punkte entfernt, um die
   Dateigröße für die Offline-Nutzung klein zu halten (~300 KB statt ~1,1 MB).

Kein externer API-Call zur Laufzeit — die SVG-Datei ist vollständig statisch
und wird lokal ausgeliefert.
