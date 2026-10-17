// Read-only reference data, sourced from free-exercise-db.
export interface Exercise {
  id: string
  name: string
  force: string | null
  level: string
  mechanic: string | null
  equipment: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  images: string[]
}

export interface SplitDay {
  id: string
  label: string
  targetMuscles: string[]
}

export interface Split {
  id: string
  name: string
  days: SplitDay[]
}

export interface SetEntry {
  id: string
  reps: number
  weight: number
  rpe?: number
  notes?: string
  /**
   * Pre-filled from a previous session ("start from last time") but not yet
   * confirmed — planned sets don't count as logged work until ticked off, and
   * are dropped (or kept, by choice) when the session is finished.
   */
  planned?: boolean
}

export interface LoggedExercise {
  id: string
  exerciseId: string
  exerciseName: string
  sets: SetEntry[]
}

export interface BodyWeightEntry {
  id: string
  date: string // ISO date-time
  weightKg: number
}

/** A day you meant to train but didn't (or a deliberate rest day). */
export interface SkippedDay {
  id: string
  date: string // local calendar date, YYYY-MM-DD
  splitDayId: string | null
  splitDayLabel: string | null
  reason: string
}

export interface WorkoutSession {
  id: string
  date: string // ISO date-time, when the session was started
  completedAt: string | null
  splitDayId: string | null
  splitDayLabel: string
  /** Snapshot of the split day's target muscles at the time the session was started. */
  targetMuscles: string[]
  exercises: LoggedExercise[]
}
