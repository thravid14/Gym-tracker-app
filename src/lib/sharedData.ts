// Small, deliberately unprefixed localStorage contract shared with the meal-prep
// app ("What Can I Make"), now that both apps live under one origin (this app is
// proxied at /gym/ on the meal app's domain). Keep this file and its counterpart
// in the meal-prep repo (src/lib/sharedData.ts there) in sync if the schema changes.

const SHARED_WORKOUT_DAYS_KEY = 'shared:workoutDays'

/** Local (not UTC) calendar date as YYYY-MM-DD, matching the meal app's todayKey(). */
function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function readWorkoutDays(): string[] {
  try {
    const raw = localStorage.getItem(SHARED_WORKOUT_DAYS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Marks today as a workout day in the shared store, for the meal app to read. */
export function markWorkoutToday(): void {
  try {
    const days = readWorkoutDays()
    const today = todayKey()
    if (!days.includes(today)) {
      localStorage.setItem(SHARED_WORKOUT_DAYS_KEY, JSON.stringify([...days, today]))
    }
  } catch {
    // localStorage unavailable — the workout still finishes locally either way
  }
}
