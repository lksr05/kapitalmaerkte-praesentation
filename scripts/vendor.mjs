#!/usr/bin/env node
/* Kopiert reveal.js aus node_modules nach vendor/reveal/, damit die Präsentation
   ohne Build und ohne Internet läuft (index.html direkt öffnen, GitHub Pages).
   Aufruf nach einem Update von reveal.js:  yarn vendor */
import { cp, mkdir, readFile, rm } from "node:fs/promises";

const SRC = new URL("../node_modules/reveal.js/", import.meta.url);
const DEST = new URL("../vendor/reveal/", import.meta.url);
const FILES = ["dist/reveal.js", "dist/reveal.css", "dist/plugin/notes.js", "LICENSE"];

const { version } = JSON.parse(await readFile(new URL("package.json", SRC), "utf8"));
await rm(DEST, { recursive: true, force: true });
for (const f of FILES) {
  const to = new URL(f.replace(/^dist\//, ""), DEST);
  await mkdir(new URL(".", to), { recursive: true });
  await cp(new URL(f, SRC), to);
}
console.log(`vendor/reveal/: reveal.js ${version} (${FILES.length} Dateien)`);
