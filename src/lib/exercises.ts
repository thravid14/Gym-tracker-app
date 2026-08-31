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
