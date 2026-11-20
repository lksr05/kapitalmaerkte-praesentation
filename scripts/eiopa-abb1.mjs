#!/usr/bin/env node
/* Daten für Folie 5 (Abbildung 1, Kogler et al. 2024) direkt bei EIOPA abgreifen.

   Quelle: EIOPA Insurance Statistics, "Exposure data" (S.06.02, Solo, quartalsweise), CC BY 4.0
   https://www.eiopa.europa.eu/tools-and-data/insurance-statistics_en

   Aufruf (Yarn):
     yarn data                          lädt SQ_Exposure.xlsx (~70 MB) und schreibt js/abb1-data.js
     yarn data pfad/datei.xlsx          nutzt eine bereits heruntergeladene Datei

   Ergebnis: js/abb1-data.js mit allen Quartalen für die 10 Länder der Abbildung,
   Werte in Mrd. EUR je Kategorie (alle Portfoliotypen, alle Versicherungsarten). */
import { createWriteStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import ExcelJS from "exceljs";

const URL = "https://www.eiopa.europa.eu/assets/insurance-statistics/SQ_Exposure.xlsx";
const SHEET = "Exposure (Raw data)";
const OUT = new globalThis.URL("../js/abb1-data.js", import.meta.url);

const COUNTRIES = [["SE", "Schweden"], ["FI", "Finnland"], ["DK", "Dänemark"], ["NO", "Norwegen"],
  ["FR", "Frankreich"], ["DE", "Deutschland"], ["PL", "Polen"], ["IT", "Italien"],
  ["NL", "Niederlande"], ["ES", "Spanien"]];

// Kategorien der Abbildung (Reihenfolge = Stapelreihenfolge von unten nach oben).
const CATS = [["ek", "Eigenkapitalbeteiligungen"], ["hfpe", "Hedgefonds und Private Equity Fonds"],
  ["ua", "Unternehmensanleihen"], ["anl", "Anleihen"], ["sa", "Staatsanleihen"],
  ["immo", "Grundstücke und Gebäude"], ["kred", "Kredite"], ["cash", "Bargeld und Einlagen"],
  ["sfonds", "Sonstige Fonds"], ["sonst", "Sonstige"]];

// Zuordnung der CIC-Kategorien (Solvency II) zu den Kategorien der Abbildung.
// Rekonstruiert: reproduziert Abbildung 1 für Q4 2022 auf ca. ±1 Prozentpunkt.
// CIC 4 (Investmentfonds) wird nach Fondsart aufgeteilt (Unterkategorie 1–9).
const MAIN = { 1: "sa", 2: "ua", 3: "ek", 5: "hfpe", 6: "sonst", 7: "cash", 8: "kred", 9: "immo", 0: "sonst" };
const FUNDS = {
  1: "ek",      // Aktienfonds
  2: "anl",     // Rentenfonds
  3: "cash",    // Geldmarktfonds
  4: "hfpe",    // Mischfonds (asset allocation)
  5: "sfonds",  // Immobilienfonds
  6: "hfpe",    // Alternative Fonds (Hedgefonds)
  7: "hfpe",    // Private-Equity-Fonds
  8: "sfonds",  // Infrastrukturfonds
  9: "sfonds",  // sonstige Fonds
};

async function download() {
  const path = join(tmpdir(), "SQ_Exposure.xlsx");
  console.log("Lade", URL);
  const res = await fetch(URL, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Download fehlgeschlagen: HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(path));
  return path;
}

const path = process.argv[2] || await download();
console.log("Lese", path, "(dauert etwas) …");

const codes = new Set(COUNTRIES.map(([c]) => c));
const sums = new Map(); // "quarter|country|cat" -> Mio. EUR
let extracted = null, found = false;

const reader = new ExcelJS.stream.xlsx.WorkbookReader(path, {
  worksheets: "emit", sharedStrings: "cache", hyperlinks: "ignore", styles: "ignore", entries: "ignore",
});
for await (const ws of reader) {
  if (ws.name !== SHEET) { for await (const _ of ws) {} continue; }   // andere Blätter überspringen
  found = true;
  let ix = null;
  for await (const row of ws) {
    const v = row.values; // 1-basiert
    if (!ix) {
      const head = v.map(String);
      const col = n => { const i = head.indexOf(n); if (i < 0) throw new Error(`Spalte fehlt: ${n}`); return i; };
      ix = { q: col("Reference period"), c: col("NCA_ISO_CODE"), main: col("CIC main category identifier"),
             sub: col("CIC sub-category identifier"), val: col("Value (euro millions)"), ext: col("Date of extraction (yyyymmdd)") };
      continue;
    }
    if (!codes.has(v[ix.c])) continue;
    const main = v[ix.main];
    // "z01 Not reported" (ohne CIC-Code, kleine Beträge) -> Sonstige
    const cat = String(main) === "4" ? (FUNDS[v[ix.sub]] ?? "sfonds") : (MAIN[main] ?? "sonst");
    const key = `${v[ix.q]}|${v[ix.c]}|${cat}`;
    sums.set(key, (sums.get(key) ?? 0) + (Number(v[ix.val]) || 0));
    extracted = v[ix.ext];
  }
}
if (!found) throw new Error(`Tabellenblatt "${SHEET}" nicht gefunden – hat EIOPA das Format geändert?`);

const quarters = [...new Set([...sums.keys()].map(k => k.split("|")[0]))].sort();
const round2 = x => Math.round(x * 100) / 100;
const data = Object.fromEntries(quarters.map(q => [q, Object.fromEntries(COUNTRIES.map(([c]) =>
  [c, CATS.map(([k]) => round2((sums.get(`${q}|${c}|${k}`) ?? 0) / 1000))]))]));

const payload = {
  source: "EIOPA Insurance Statistics, Exposure data (S.06.02, Solo, quartalsweise), CC BY 4.0",
  url: URL, extracted: String(extracted), unit: "Mrd. EUR",
  countries: COUNTRIES.map(([code, name]) => ({ code, name })),
  categories: CATS.map(([key, name]) => ({ key, name })),
  quarters, data,
};
await writeFile(OUT, "/* Automatisch erzeugt von scripts/eiopa-abb1.mjs – nicht von Hand bearbeiten. */\n" +
  "window.ABB1 = " + JSON.stringify(payload) + ";\n");
console.log(`js/abb1-data.js: ${quarters.length} Quartale (${quarters[0]} – ${quarters.at(-1)}), Stand EIOPA-Extrakt ${extracted}`);
