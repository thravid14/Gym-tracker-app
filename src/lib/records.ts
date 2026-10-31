import type { WorkoutSession } from '../types'

/**
 * Personal records are tracked three ways per exercise:
 * - weight: heaviest weight lifted (more reps at the same weight also counts)
 * - e1rm:   best estimated one-rep max (Epley), from sets of 1-12 reps
 * - reps:   most reps in a set, for bodyweight sets (no weight logged)
 */
export type PRKind = 'weight' | 'e1rm' | 'reps'

export interface WeightBest {
  weight: number
  reps: number
  date: string
  sessionId: string
}
export interface E1rmBest {
  e1rm: number
  weight: number
  reps: number
  date: string
  sessionId: string
}
export interface RepsBest {
  reps: number
  date: string
  sessionId: string
}

interface Bests {
  weight: WeightBest | null
  e1rm: E1rmBest | null
  reps: RepsBest | null
}

export interface ExerciseRecord extends Bests {
  exerciseId: string
  exerciseName: string
  /** ISO date of the most recent record set, for sorting / "new" badges. */
  lastRecordAt: string
}

export interface PRAnalysis {
  /** sessionId -> (setId -> the PR that set achieved). */
  setPRs: Map<string, Map<string, PRKind>>
  records: ExerciseRecord[]
}

export const PR_LABELS: Record<PRKind, string> = {
  weight: 'Weight PR',
  e1rm: '1RM PR',
  reps: 'Rep PR',
}

/** Epley estimate; only meaningful for low-rep sets, so null above 12 reps. */
export function estimateOneRepMax(weight: number, reps: number): number | null {
  if (weight <= 0 || reps < 1 || reps > 12) return null
  return reps === 1 ? weight : weight * (1 + reps / 30)
}

const EPSILON = 1e-9
const PRIORITY: PRKind[] = ['weight', 'e1rm', 'reps']

/**
 * Walks every session oldest-first. A set is flagged as a PR only if it beats
 * what you'd done in *earlier sessions* (so your first time doing an exercise
 * is a baseline, and warm-up ramps don't light up) — and only the set that
 * ends up holding the record in its session is flagged, not every step on
 * the way to it. Planned (not yet ticked off) sets are ignored.
 */
export function analyzePRs(sessions: WorkoutSession[]): PRAnalysis {
  const ordered = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  const bests = new Map<string, Bests>()
  const names = new Map<string, string>()
  const setPRs = new Map<string, Map<string, PRKind>>()

  for (const session of ordered) {
    // Bests as they stood before this session; `running` accumulates within it.
    const running = new Map<string, Bests>()
    const holders = new Map<string, string>() // `${exerciseId}|${kind}` -> setId

    for (const logged of session.exercises) {
      names.set(logged.exerciseId, logged.exerciseName)
      const prior = bests.get(logged.exerciseId)
      let run = running.get(logged.exerciseId)
      if (!run) {
        run = prior ? { ...prior } : { weight: null, e1rm: null, reps: null }
        running.set(logged.exerciseId, run)
      }

      for (const set of logged.sets) {
        if (set.planned || set.reps <= 0) continue
        const base = { date: session.date, sessionId: session.id }
        const hold = (kind: PRKind) => {
          if (prior?.[kind]) holders.set(`${logged.exerciseId}|${kind}`, set.id)
        }

        if (set.weight > 0) {
          const w = run.weight
          if (!w || set.weight > w.weight || (set.weight === w.weight && set.reps > w.reps)) {
            run.weight = { weight: set.weight, reps: set.reps, ...base }
            hold('weight')
          }
          const e = estimateOneRepMax(set.weight, set.reps)
          if (e !== null && (!run.e1rm || e > run.e1rm.e1rm + EPSILON)) {
            run.e1rm = { e1rm: e, weight: set.weight, reps: set.reps, ...base }
            hold('e1rm')
          }
        } else if (!run.reps || set.reps > run.reps.reps) {
          run.reps = { reps: set.reps, ...base }
          hold('reps')
        }
      }
    }

    // One badge per set, using the most meaningful record it set.
    const byKind = new Map<string, PRKind[]>() // setId -> kinds
    for (const [key, setId] of holders) {
      const kind = key.split('|')[1] as PRKind
      byKind.set(setId, [...(byKind.get(setId) ?? []), kind])
    }
    const flagged = new Map<string, PRKind>()
    for (const [setId, kinds] of byKind) {
      flagged.set(setId, PRIORITY.find((k) => kinds.includes(k))!)
    }
    if (flagged.size > 0) setPRs.set(session.id, flagged)

    for (const [exerciseId, run] of running) bests.set(exerciseId, run)
  }

  const records: ExerciseRecord[] = []
  for (const [exerciseId, b] of bests) {
    const dates = [b.weight?.date, b.e1rm?.date, b.reps?.date].filter((d): d is string => !!d)
    if (dates.length === 0) continue
    records.push({
      exerciseId,
      exerciseName: names.get(exerciseId) ?? exerciseId,
      ...b,
      lastRecordAt: dates.sort().at(-1)!,
    })
  }
  records.sort((a, b) => b.lastRecordAt.localeCompare(a.lastRecordAt))

  return { setPRs, records }
}
