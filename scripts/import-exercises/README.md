# Exercise import tool

One-off tooling (not shipped in the app) that pulls additional exercises —
with real photos — from [wger.de](https://wger.de)'s open exercise API
(CC-BY-SA licensed). This is a genuine structured API (names, muscles,
equipment, and images all embedded per-exercise), not scraping, so it's
reliable in a way a generic exercise-site scraper wouldn't be.

## Usage

1. Fetch and transform:

   ```bash
   node scripts/import-exercises/fetch-wger.mjs
   ```

   Writes `output/wger-exercises.json` — every wger exercise that has an
   English translation, at least one image, and isn't already a
   normalized-name match in `src/data/exercises.json`. Muscle and equipment
   names are hand-mapped (`MUSCLE_MAP`/`EQUIPMENT_MAP` in the script) to this
   app's existing vocabulary so the filter chips don't fragment into
   near-duplicates (e.g. "abs" vs "abdominals").

2. Review `output/wger-exercises.json`, then merge:

   ```bash
   node scripts/import-exercises/merge.mjs
   ```

   Appends anything in the output file not already present (by id) onto
   `src/data/exercises.json`.

Run `fetch-wger.mjs` again later to pick up anything new wger has added
since — it'll only add what's genuinely new.

## Note on `?raw` JSON import

`src/lib/exercises.ts` imports the bundled dataset as `?raw` text and
`JSON.parse`s it at runtime, rather than a normal
`import raw from './exercises.json'`. This is deliberate: with
`resolveJsonModule`, TypeScript infers a full literal type over the entire
array, which became minutes-long once the dataset grew past ~1000 entries.
Keep it this way (or find a better fix) rather than reverting to a plain
JSON import if the dataset grows further.
