import raw from '../data/exercises.json'
import type { Exercise } from '../types'

export const exercises = raw as Exercise[]

export const allMuscles: string[] = Array.from(
  new Set(exercises.flatMap((e) => e.primaryMuscles)),
).sort()

export const allEquipment: string[] = Array.from(
  new Set(exercises.map((e) => e.equipment).filter((e): e is string => !!e)),
).sort()

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}

export interface ExerciseFilter {
  // Matches on primary muscle only — the exercise cards in the picker only
  // display primaryMuscles, so filtering on secondary muscles too produced
  // results (e.g. "Barbell Shoulder Press") that looked like they didn't
  // match the selected muscle group at all.
  muscles?: string[]
  equipment?: string[]
  search?: string
}

export function filterExercises({ muscles, equipment, search }: ExerciseFilter): Exercise[] {
  return exercises.filter((e) => {
    if (muscles && muscles.length > 0) {
      const hit = e.primaryMuscles.some((m) => muscles.includes(m))
      if (!hit) return false
    }
    if (equipment && equipment.length > 0) {
      if (!e.equipment || !equipment.includes(e.equipment)) return false
    }
    if (search && search.trim()) {
      if (!e.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    }
    return true
  })
}

export function formatMuscle(m: string): string {
  return m.replace(/\b\w/g, (c) => c.toUpperCase())
}

// The exercise dataset's `images` field holds paths relative to
// free-exercise-db's own exercises/ folder (e.g. "3_4_Sit-Up/0.jpg") — the
// actual image files aren't bundled into this app, they're served live via
// jsDelivr's free CDN mirror of that public GitHub repo. Requires internet
// to view; the rest of the app works fully offline regardless.
const IMAGE_CDN_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'

/** Image URLs for an exercise, in order (first is usually the start position, second the end/contracted position). Empty for the handful of exercises with no source images. */
export function exerciseImageUrls(exercise: Exercise): string[] {
  return exercise.images.map((path) => IMAGE_CDN_BASE + path)
}
