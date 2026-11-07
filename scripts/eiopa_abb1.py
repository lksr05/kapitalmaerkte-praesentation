#!/usr/bin/env python3
"""Daten für Folie 5 (Abbildung 1, Kogler et al. 2024) direkt bei EIOPA abgreifen.

Quelle: EIOPA Insurance Statistics, "Exposure data" (S.06.02, Solo, quartalsweise),
https://www.eiopa.europa.eu/tools-and-data/insurance-statistics_en  (CC BY 4.0)

Aufruf (einmalig: pip install openpyxl):
    python3 scripts/eiopa_abb1.py              # lädt SQ_Exposure.xlsx (~70 MB) und schreibt js/abb1-data.js
    python3 scripts/eiopa_abb1.py datei.xlsx   # nutzt eine bereits heruntergeladene Datei

Ergebnis: js/abb1-data.js mit allen Quartalen für die 10 Länder der Abbildung,
Werte in Mrd. EUR je Kategorie (alle Portfoliotypen, alle Versicherungsarten).
"""
import json, os, sys, tempfile, urllib.request
from collections import defaultdict

URL = "https://www.eiopa.europa.eu/assets/insurance-statistics/SQ_Exposure.xlsx"
SHEET = "Exposure (Raw data)"
OUT = os.path.join(os.path.dirname(__file__), "..", "js", "abb1-data.js")

COUNTRIES = [("SE", "Schweden"), ("FI", "Finnland"), ("DK", "Dänemark"), ("NO", "Norwegen"),
             ("FR", "Frankreich"), ("DE", "Deutschland"), ("PL", "Polen"), ("IT", "Italien"),
             ("NL", "Niederlande"), ("ES", "Spanien")]

# Kategorien der Abbildung (Reihenfolge = Stapelreihenfolge von unten nach oben).
CATS = [("ek", "Eigenkapitalbeteiligungen"), ("hfpe", "Hedgefonds und Private Equity Fonds"),
        ("ua", "Unternehmensanleihen"), ("anl", "Anleihen"), ("sa", "Staatsanleihen"),
        ("immo", "Grundstücke und Gebäude"), ("kred", "Kredite"), ("cash", "Bargeld und Einlagen"),
        ("sfonds", "Sonstige Fonds"), ("sonst", "Sonstige")]

# Zuordnung der CIC-Kategorien (Solvency II) zu den Kategorien der Abbildung.
# Rekonstruiert: reproduziert Abbildung 1 für Q4 2022 auf ca. ±1 Prozentpunkt.
# CIC 4 (Investmentfonds) wird nach Fondsart aufgeteilt (Unterkategorie 1–9).
MAIN = {"1": "sa", "2": "ua", "3": "ek", "5": "hfpe", "6": "sonst", "7": "cash", "8": "kred", "9": "immo", "0": "sonst"}
FUNDS = {"1": "ek",      # Aktienfonds
         "2": "anl",     # Rentenfonds
         "3": "cash",    # Geldmarktfonds
         "4": "hfpe",    # Mischfonds (asset allocation)
         "5": "sfonds",  # Immobilienfonds
         "6": "hfpe",    # Alternative Fonds (Hedgefonds)
         "7": "hfpe",    # Private-Equity-Fonds
         "8": "sfonds",  # Infrastrukturfonds
         "9": "sfonds"}  # sonstige Fonds


def main():
    try:
        import openpyxl
    except ImportError:
        sys.exit("Bitte zuerst installieren: pip install openpyxl")

    if len(sys.argv) > 1:
        path = sys.argv[1]
    else:
        path = os.path.join(tempfile.gettempdir(), "SQ_Exposure.xlsx")
        print("Lade", URL)
        req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())

    codes = {c for c, _ in COUNTRIES}
    sums = defaultdict(float)  # (quarter, country, cat) -> Mio. EUR
    extracted = None
    wb = openpyxl.load_workbook(path, read_only=True)
    rows = wb[SHEET].iter_rows(values_only=True)
    head = next(rows)
    ix = {k: head.index(k) for k in ("Reference period", "NCA_ISO_CODE", "CIC main category identifier",
                                     "CIC sub-category identifier", "Value (euro millions)",
                                     "Date of extraction (yyyymmdd)")}
    for r in rows:
        c = r[ix["NCA_ISO_CODE"]]
        if c not in codes:
            continue
        main_id = str(r[ix["CIC main category identifier"]])
        # "z01 Not reported" (ohne CIC-Code, kleine Beträge) -> Sonstige
        cat = FUNDS.get(str(r[ix["CIC sub-category identifier"]]), "sfonds") if main_id == "4" else MAIN.get(main_id, "sonst")
        sums[(r[ix["Reference period"]], c, cat)] += float(r[ix["Value (euro millions)"]] or 0)
        extracted = r[ix["Date of extraction (yyyymmdd)"]]

    quarters = sorted({q for q, _, _ in sums})
    data = {q: {c: [round(sums[(q, c, k)] / 1000, 2) for k, _ in CATS] for c, _ in COUNTRIES} for q in quarters}
    payload = {
        "source": "EIOPA Insurance Statistics, Exposure data (S.06.02, Solo, quartalsweise), CC BY 4.0",
        "url": URL, "extracted": str(extracted), "unit": "Mrd. EUR",
        "countries": [{"code": c, "name": n} for c, n in COUNTRIES],
        "categories": [{"key": k, "name": n} for k, n in CATS],
        "quarters": quarters, "data": data,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Automatisch erzeugt von scripts/eiopa_abb1.py – nicht von Hand bearbeiten. */\n")
        f.write("window.ABB1 = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"{OUT}: {len(quarters)} Quartale ({quarters[0]} – {quarters[-1]}), Stand EIOPA-Extrakt {extracted}")


if __name__ == "__main__":
    main()
