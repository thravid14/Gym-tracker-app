#!/usr/bin/env node
/**
 * Appends output/wger-exercises.json (from fetch-wger.mjs) onto the bundled
 * src/data/exercises.json. Run fetch-wger.mjs first and review its output.
 *
 * Usage:
 *   node scripts/import-exercises/merge.mjs
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXISTING_FILE = path.join(__dirname, '..', '..', 'src', 'data', 'exercises.json')
const NEW_FILE = path.join(__dirname, 'output', 'wger-exercises.json')

async function main() {
  const existing = JSON.parse(await readFile(EXISTING_FILE, 'utf8'))
  const toAdd = JSON.parse(await readFile(NEW_FILE, 'utf8'))

  const existingIds = new Set(existing.map((e) => e.id))
  const fresh = toAdd.filter((e) => !existingIds.has(e.id))

  const merged = [...existing, ...fresh]
  await writeFile(EXISTING_FILE, JSON.stringify(merged, null, 2) + '\n')

  console.log(`Before: ${existing.length}`)
  console.log(`Added: ${fresh.length} (${toAdd.length - fresh.length} already present, skipped)`)
  console.log(`After: ${merged.length}`)
}

main()
