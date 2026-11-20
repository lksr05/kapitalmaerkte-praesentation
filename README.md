# Kapitalmärkte stärken

[reveal.js](https://revealjs.com)-Präsentation (10 Min.) zu Kogler, Malmendier, Nöh & Schaffranka (2024), Wirtschaftsdienst 104(8), 539–542.

Öffnen: `index.html` direkt im Browser – funktioniert komplett offline, ohne Server und ohne Build (reveal.js 6 liegt lokal unter `vendor/reveal/`).

Entwickeln (optional, Node ≥ 20, Yarn 4 via Corepack):

```
yarn install       # einmalig
yarn start         # Dev-Server mit Live-Reload, öffnet den Browser
yarn vendor        # nach einem Update von reveal.js: Dateien nach vendor/reveal/ kopieren
```

Tasten: **→/Leertaste** weiter · **←** zurück · **F** Vollbild · **S** Referentenansicht (eigenes Fenster mit Notizen, nächster Folie und Uhr) · **Esc** Übersicht · **B** Bildschirm schwarz.

## Sprechernotizen

- **Referentenansicht:** Taste **S** öffnet ein zweites Fenster mit aktueller und nächster Folie (inkl. Klick-Schritten), den Notizen der Folie sowie Uhrzeit und Timer. Beide Fenster bleiben synchron, weiterklicken geht in beiden.
- **Nichts passiert?** Der Browser hat das Pop-up blockiert: Pop-ups für die Seite erlauben (Chrome: Symbol rechts in der Adressleiste) und **S** erneut drücken. Funktioniert auch bei `file://`.
- **Am Beamer:** Bildschirme erweitern statt spiegeln (macOS: Systemeinstellungen → Displays), Präsentationsfenster auf den Beamer ziehen und mit **F** auf Vollbild schalten; das Notizenfenster bleibt auf dem Laptop.
- **Ohne zweites Fenster:** `index.html?showNotes=true` zeigt die Notizen unter den Folien. `index.html?print-pdf&showNotes=true` druckt sie unter jede Folie, gut als Ausdruck zum Üben.

## PDF / Ausdruck

`index.html?print-pdf` öffnen, kurz warten, dann in Chrome „Drucken → Als PDF sichern“ (Ränder: keine, Hintergrundgrafiken: an). Eine Folie pro Seite im Endzustand, ohne Bedienelemente.

## Struktur

`css/style.css` (Styles), `js/main.js` (reveal.js-Konfiguration, Zahnräder, Seitenzahlen, Hochzählen), `vendor/reveal/` (reveal.js + Notizen-Plugin), `fonts/` (Inter, SIL Open Font License). Klick-Schritte sind reveal.js-Fragments (`class="fragment fade-up"`), Sprechernotizen stehen als `<aside class="notes">` in jeder Folie.

## Folie 5: interaktives Diagramm

Folie 5 zeichnet Abbildung 1 des Artikels aus den EIOPA-Rohdaten nach ([Insurance Statistics](https://www.eiopa.europa.eu/tools-and-data/insurance-statistics_en), Exposure data S.06.02, Solo, quartalsweise, CC BY 4.0). Hover zeigt Anteil und Volumen (nur Tooltip). Ein Klick auf einen Legendeneintrag hebt die Kategorie hervor, ein zweiter Klick hebt das wieder auf. Der Schalter „Anleihen zusammenfassen“ fasst Unternehmensanleihen, Anleihen(fonds) und Staatsanleihen zu einer Säule zusammen (Tooltip zeigt die Aufteilung). Der Regler oben rechts wechselt das Quartal (2017 Q4 – aktuell). Beim Betreten der Folie gilt immer: Q4/2022, Schalter aus, nichts hervorgehoben.

Die Daten liegen offline in `js/abb1-data.js`. Aktualisieren:

```
yarn data          # lädt SQ_Exposure.xlsx (~70 MB) von EIOPA und schreibt js/abb1-data.js
```

Die Zuordnung der CIC-Kategorien zu den zehn Kategorien der Abbildung steht in `scripts/eiopa-abb1.mjs`. Sie ist rekonstruiert und trifft die Originalabbildung auf etwa ±1 Prozentpunkt (EIOPA korrigiert ältere Quartale gelegentlich nachträglich).

`abb1.png` ist die Originalabbildung aus dem Artikel; sie wird nur angezeigt, falls die Diagrammdaten fehlen.
