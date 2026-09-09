#!/usr/bin/env node
/**
 * One-off tool (not shipped in the app) to pull additional exercises, with
 * real photos, from wger.de's open exercise API (CC-BY-SA licensed data,
 * https://wger.de/api/v2/). Unlike scraping arbitrary recipe/exercise blogs,
 * this is a genuine structured API — same spirit as free-exercise-db (our
 * existing bundled source), just a second one, so no per-site scraping
 * logic is needed.
 *
 * Usage:
 *   node scripts/import-exercises/fetch-wger.mjs
 *
 * Writes output/wger-exercises.json — new Exercise objects (our app's
 * shape) for every wger exercise that (a) has an English translation,
 * (b) has at least one image, and (c) doesn't already exist in
 * src/data/exercises.json under a normalized-name match. Review the output,
 * then run merge.mjs to append it to the bundled dataset.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXISTING_FILE = path.join(__dirname, '..', '..', 'src', 'data', 'exercises.json')
const OUTPUT_DIR = path.join(__dirname, 'output')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'wger-exercises.json')

const API_BASE = 'https://wger.de/api/v2'
const ENGLISH_LANGUAGE_ID = 2
const PAGE_SIZE = 100

// wger's muscle list is small (15) and stable enough to hand-map to this
// app's existing muscle vocabulary (derived from free-exercise-db) rather
// than introduce near-duplicate filter chips like "abs" vs "abdominals".
const MUSCLE_MAP = {
  'Anterior deltoid': 'shoulders',
  'Biceps brachii': 'biceps',
  'Biceps femoris': 'hamstrings',
  Brachialis: 'biceps',
  Gastrocnemius: 'calves',
  'Gluteus maximus': 'glutes',
  'Latissimus dorsi': 'lats',
  'Obliquus externus abdominis': 'abdominals',
  'Pectoralis major': 'chest',
  'Quadriceps femoris': 'quadriceps',
  'Rectus abdominis': 'abdominals',
  'Serratus anterior': 'chest',
  Soleus: 'calves',
  Trapezius: 'traps',
  'Triceps brachii': 'triceps',
}

// Ranked so a multi-equipment exercise picks the most specific/meaningful
// one first, falling back to generic entries.
const EQUIPMENT_MAP = {
  Barbell: 'barbell',
  Dumbbell: 'dumbbell',
  Kettlebell: 'kettlebells',
  'Cable machine': 'cable',
  'Resistance band': 'bands',
  'SZ-Bar': 'e-z curl bar',
  'Swiss Ball': 'exercise ball',
  'none (bodyweight exercise)': 'body only',
  Bench: 'other',
  'Incline bench': 'other',
  'Pull-up bar': 'other',
  'Gym mat': 'other',
}
const EQUIPMENT_PRIORITY = [
  'barbell', 'dumbbell', 'kettlebells', 'cable', 'bands', 'e-z curl bar',
  'exercise ball', 'body only', 'other',
]

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function htmlToParagraphs(html) {
  if (!html) return []
  return html
    .split(/<\/p>|<br\s*\/?>/i)
    .map((s) => s.replace(/<[^>]+>/g, '').trim())
    .map((s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim())
    .filter(Boolean)
}

function pickEquipment(equipmentList) {
  const mapped = equipmentList.map((e) => EQUIPMENT_MAP[e.name]).filter(Boolean)
  for (const preferred of EQUIPMENT_PRIORITY) {
    if (mapped.includes(preferred)) return preferred
  }
  return null
}

async function fetchAllExerciseInfo() {
  const all = []
  let url = `${API_BASE}/exerciseinfo/?format=json&limit=${PAGE_SIZE}`
  while (url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
    const data = await res.json()
    all.push(...data.results)
    url = data.next
    process.stdout.write(`\rFetched ${all.length} exercises...`)
  }
  console.log('')
  return all
}

async function main() {
  const existingRaw = JSON.parse(await readFile(EXISTING_FILE, 'utf8'))
  const existingNames = new Set(existingRaw.map((e) => normalizeName(e.name)))
  console.log(`Existing bundled exercises: ${existingRaw.length}`)

  const wgerExercises = await fetchAllExerciseInfo()
  console.log(`wger exercises fetched: ${wgerExercises.length}`)

  const results = []
  const skipped = { noEnglish: 0, noImage: 0, duplicate: 0 }

  for (const ex of wgerExercises) {
    const translation = ex.translations?.find((t) => t.language === ENGLISH_LANGUAGE_ID)
    if (!translation?.name) {
      skipped.noEnglish++
      continue
    }
    if (!ex.images || ex.images.length === 0) {
      skipped.noImage++
      continue
    }
    const normalized = normalizeName(translation.name)
    if (existingNames.has(normalized)) {
      skipped.duplicate++
      continue
    }
    existingNames.add(normalized) // guard against wger's own internal duplicates too

    const primaryMuscles = [...new Set((ex.muscles ?? []).map((m) => MUSCLE_MAP[m.name]).filter(Boolean))]
    const secondaryMuscles = [
      ...new Set((ex.muscles_secondary ?? []).map((m) => MUSCLE_MAP[m.name]).filter(Boolean)),
    ].filter((m) => !primaryMuscles.includes(m))

    if (primaryMuscles.length === 0) {
      // Can't be filtered by muscle group at all — not useful in this app.
      continue
    }

    results.push({
      id: `wger-${ex.id}`,
      name: translation.name,
      force: null,
      level: 'beginner',
      mechanic: null,
      equipment: pickEquipment(ex.equipment ?? []),
      primaryMuscles,
      secondaryMuscles,
      instructions: htmlToParagraphs(translation.description),
      category: (ex.category?.name ?? 'strength').toLowerCase(),
      // Full URLs (unlike free-exercise-db's relative paths) — this app's
      // exerciseImageUrls() needs to pass these through as-is rather than
      // prefixing with the jsDelivr CDN base.
      images: ex.images.filter((img) => img.image).map((img) => img.image),
    })
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2))

  console.log(`\nNew exercises: ${results.length}`)
  console.log(`Skipped — no English translation: ${skipped.noEnglish}`)
  console.log(`Skipped — no image: ${skipped.noImage}`)
  console.log(`Skipped — duplicate of existing: ${skipped.duplicate}`)
  console.log(`Written to ${OUTPUT_FILE}`)
}

main()
