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
