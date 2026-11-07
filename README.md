# Kapitalmärkte stärken

impress.js-Präsentation (10 Min.) zu Kogler, Malmendier, Nöh & Schaffranka (2024), Wirtschaftsdienst 104(8), 539–542.

Öffnen: `index.html` im Browser – funktioniert komplett offline (impress.js 2.0.0 liegt lokal unter `js/`). Vollbild mit **F**.

Tasten: **→/Leertaste** weiter · **F** Vollbild · **P** Referentenansicht (eigenes Fenster mit Notizen, nächster Folie und Uhr).

PDF / Ausdruck: im Browser (am besten Chrome) „Drucken → Als PDF sichern“ – eine Folie pro Seite, alle Animationsschritte sichtbar.

Struktur: `css/style.css` (Styles), `js/main.js` (Zahnräder, Seitenzahlen, Animationen), `js/impress.js` (Bibliothek), `fonts/` (Inter, SIL Open Font License). Sprechernotizen stehen als `<div class="notes">` in jeder Folie.

## Folie 5: interaktives Diagramm

Folie 5 zeichnet Abbildung 1 des Artikels aus den EIOPA-Rohdaten nach ([Insurance Statistics](https://www.eiopa.europa.eu/tools-and-data/insurance-statistics_en), Exposure data S.06.02, Solo, quartalsweise, CC BY 4.0). Hover zeigt Anteil und Volumen (nur Tooltip). Ein Klick auf einen Legendeneintrag hebt die Kategorie hervor, ein zweiter Klick hebt das wieder auf. Der Schalter „Anleihen zusammenfassen“ fasst Unternehmensanleihen, Anleihen(fonds) und Staatsanleihen zu einer Säule zusammen (Tooltip zeigt die Aufteilung). Der Regler oben rechts wechselt das Quartal (2017 Q4 – aktuell). Beim Betreten der Folie gilt immer: Q4/2022, Schalter aus, nichts hervorgehoben.

Die Daten liegen offline in `js/abb1-data.js`. Aktualisieren:

```
pip install openpyxl
python3 scripts/eiopa_abb1.py      # lädt SQ_Exposure.xlsx (~70 MB) von EIOPA
```

Die Zuordnung der CIC-Kategorien zu den zehn Kategorien der Abbildung steht im Skript. Sie ist rekonstruiert und trifft die Originalabbildung auf etwa ±1 Prozentpunkt (EIOPA korrigiert ältere Quartale gelegentlich nachträglich).

`abb1.png` ist die Originalabbildung aus dem Artikel; sie wird nur angezeigt, falls die Diagrammdaten fehlen.
