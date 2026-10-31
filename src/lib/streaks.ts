import { dateFromKey, localDateKey } from './dates'
import type { SkippedDay, WorkoutSession } from '../types'

export interface StreakInfo {
  /** Consecutive days trained, ending today (or yesterday if today isn't done yet). */
  current: number
  /** Longest run of consecutive trained days ever. */
  longest: number
  trainedToday: boolean
  /** True when there's a live streak that today's session would extend (and today isn't logged as rest). */
  atRisk: boolean
}

function isRestDay(skip: SkippedDay): boolean {
  return skip.reason.trim().toLowerCase() === 'rest day'
}

function nextKey(key: string): string {
  const d = dateFromKey(key)
  d.setDate(d.getDate() + 1)
  return localDateKey(d)
}

/**
 * Workout streak rules:
 * - Each day with a completed workout adds 1.
 * - A day logged as skipped with the reason "Rest day" is a deliberate rest — it
 *   bridges the streak (doesn't add to it, doesn't break it).
 * - A day with nothing logged, or skipped for any other reason, breaks it.
 * - Today is the exception: until it's over, an empty today never breaks the
 *   streak, so you keep it while you haven't trained yet.
 */
export function computeStreaks(
  sessions: WorkoutSession[],
  skippedDays: SkippedDay[],
  today: string = localDateKey(),
): StreakInfo {
  const trained = new Set(
    sessions.filter((s) => s.completedAt).map((s) => localDateKey(new Date(s.date))),
  )
  const skips = new Map(skippedDays.map((s) => [s.date, s]))

  const trainedToday = trained.has(today)
  const empty = { current: 0, longest: 0, trainedToday, atRisk: false }
  if (trained.size === 0) return empty

  const first = [...trained].sort()[0]
  let run = 0
  let longest = 0

  for (let day = first; day <= today; day = nextKey(day)) {
    if (trained.has(day)) {
      run += 1
      longest = Math.max(longest, run)
      continue
    }
    const skip = skips.get(day)
    if (skip && isRestDay(skip)) continue // bridge
    if (day === today && !skip) continue // today still open
    run = 0
  }

  const restToday = skips.get(today) ? isRestDay(skips.get(today)!) : false
  return {
    current: run,
    longest,
    trainedToday,
    atRisk: run > 0 && !trainedToday && !restToday,
  }
}
