import type { SetEntry } from '../types'

export interface SuggestedSet {
  weight: number
  reps: number
  label: string
}

/** The heaviest set (ties broken by more reps) from a past set list. */
function topSet(sets: SetEntry[]): SetEntry | null {
  if (sets.length === 0) return null
  return sets.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best,
  )
}

/**
 * A simple progressive-overload nudge based on the last time this exercise
 * was logged: ~5% more weight (rounded to the nearest 0.5kg, minimum 0.5kg)
 * at the same reps, or +1 rep for bodyweight moves (no weight logged).
 */
export function suggestNextSet(lastSets: SetEntry[]): SuggestedSet | null {
  const last = topSet(lastSets)
  if (!last) return null

  if (last.weight > 0) {
    const rawIncrement = last.weight * 0.05
    const increment = Math.max(0.5, Math.round(rawIncrement / 0.5) * 0.5)
    const weight = Math.round((last.weight + increment) * 2) / 2
    return { weight, reps: last.reps, label: `+${increment}kg from last time` }
  }

  return { weight: 0, reps: last.reps + 1, label: '+1 rep from last time' }
}
