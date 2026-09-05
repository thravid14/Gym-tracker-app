import { getExerciseById } from './exercises'
import type { Exercise, WorkoutSession } from '../types'

/**
 * Total volume (sum of weight x reps) per primary muscle, across completed
 * sessions within the last `days` days. Volume is attributed to each of an
 * exercise's primary muscles only (secondary muscles aren't counted) to keep
 * the numbers easy to reason about.
 */
export function computeVolumeByMuscle(
  sessions: WorkoutSession[],
  days: number,
  exerciseLibrary: Exercise[],
): Record<string, number> {
  const cutoff = Date.now() - days * 86_400_000
  const totals: Record<string, number> = {}

  for (const session of sessions) {
    if (!session.completedAt) continue
    if (new Date(session.date).getTime() < cutoff) continue

    for (const logged of session.exercises) {
      const exercise = getExerciseById(exerciseLibrary, logged.exerciseId)
      if (!exercise) continue
      const volume = logged.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      if (volume === 0) continue
      for (const muscle of exercise.primaryMuscles) {
        totals[muscle] = (totals[muscle] ?? 0) + volume
      }
    }
  }

  return totals
}
