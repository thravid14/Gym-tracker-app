import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { newId, usePersistedState } from '../lib/storage'
import { markWorkoutToday } from '../lib/sharedData'
import { localDateKey } from '../lib/dates'
import type {
  BodyWeightEntry,
  LoggedExercise,
  SetEntry,
  SkippedDay,
  Split,
  SplitDay,
  WorkoutSession,
} from '../types'

interface AppStateValue {
  split: Split | null
  saveSplit: (split: Split) => void

  sessions: WorkoutSession[]
  activeSession: WorkoutSession | null

  bodyWeightEntries: BodyWeightEntry[]
  addBodyWeightEntry: (date: string, weightKg: number) => void
  removeBodyWeightEntry: (id: string) => void

  skippedDays: SkippedDay[]
  /** One skip per calendar date — logging a date that already has one replaces it. */
  addSkippedDay: (input: Omit<SkippedDay, 'id'>) => void
  removeSkippedDay: (id: string) => void

  /** Most recent completed session for this split day, if there is one. */
  getLastSessionForDay: (day: SplitDay) => WorkoutSession | null
  /**
   * Starts a session. For a split day that has been done before, `copyLast`
   * (default true) pre-fills it with last time's exercises and sets as
   * unconfirmed "planned" sets.
   */
  startSession: (day: SplitDay | null, copyLast?: boolean) => WorkoutSession
  confirmSet: (sessionId: string, loggedExerciseId: string, setId: string, done: boolean) => void
  confirmAllSets: (sessionId: string, loggedExerciseId: string) => void
  addExerciseToSession: (sessionId: string, exerciseId: string, exerciseName: string) => void
  removeExerciseFromSession: (sessionId: string, loggedExerciseId: string) => void
  addSet: (sessionId: string, loggedExerciseId: string, set: Omit<SetEntry, 'id'>) => void
  updateSet: (
    sessionId: string,
    loggedExerciseId: string,
    setId: string,
    patch: Partial<Omit<SetEntry, 'id'>>,
  ) => void
  removeSet: (sessionId: string, loggedExerciseId: string, setId: string) => void
  /**
   * Marks the session complete. Unconfirmed planned sets are either kept
   * (counted as done) or discarded, along with any exercise they leave empty.
   */
  finishSession: (sessionId: string, plannedSets?: 'keep' | 'discard') => void
  deleteSession: (sessionId: string) => void

  /** Most recent *other* logged instance of this exercise, most recent first. */
  getExerciseHistory: (exerciseId: string, excludeSessionId?: string) => Array<{
    session: WorkoutSession
    logged: LoggedExercise
  }>
}

const AppStateContext = createContext<AppStateValue | null>(null)

/**
 * Matches on the split day's id, falling back to its label (case-insensitive)
 * so history survives the day being re-created in Split setup — presets
 * mint new ids, but a "Push" day is still the same Push day to the person.
 */
function findLastSessionForDay(sessions: WorkoutSession[], day: SplitDay): WorkoutSession | null {
  const label = day.label.trim().toLowerCase()
  const matches = sessions.filter(
    (s) =>
      s.completedAt &&
      s.exercises.some((e) => e.sets.length > 0) &&
      (s.splitDayId === day.id || s.splitDayLabel.trim().toLowerCase() === label),
  )
  if (matches.length === 0) return null
  return matches.reduce((latest, s) => (s.date > latest.date ? s : latest))
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [split, setSplit] = usePersistedState<Split | null>('split', null)
  const [sessions, setSessions] = usePersistedState<WorkoutSession[]>('sessions', [])
  const [activeSessionId, setActiveSessionId] = usePersistedState<string | null>(
    'activeSessionId',
    null,
  )
  const [bodyWeightEntries, setBodyWeightEntries] = usePersistedState<BodyWeightEntry[]>(
    'bodyWeight',
    [],
  )
  const [skippedDays, setSkippedDays] = usePersistedState<SkippedDay[]>('skippedDays', [])

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  )

  const value: AppStateValue = useMemo(
    () => ({
      split,
      saveSplit: (s: Split) => setSplit(s),

      sessions,
      activeSession,

      bodyWeightEntries,
      addBodyWeightEntry: (date, weightKg) => {
        setBodyWeightEntries((prev) =>
          [...prev, { id: newId(), date, weightKg }].sort((a, b) => a.date.localeCompare(b.date)),
        )
      },
      removeBodyWeightEntry: (id) => {
        setBodyWeightEntries((prev) => prev.filter((e) => e.id !== id))
      },

      skippedDays,
      addSkippedDay: (input) => {
        setSkippedDays((prev) => [
          { ...input, id: newId() },
          ...prev.filter((s) => s.date !== input.date),
        ])
      },
      removeSkippedDay: (id) => {
        setSkippedDays((prev) => prev.filter((s) => s.id !== id))
      },

      getLastSessionForDay: (day) => findLastSessionForDay(sessions, day),

      startSession: (day: SplitDay | null, copyLast = true) => {
        const last = day && copyLast ? findLastSessionForDay(sessions, day) : null
        const session: WorkoutSession = {
          id: newId(),
          date: new Date().toISOString(),
          completedAt: null,
          splitDayId: day?.id ?? null,
          splitDayLabel: day?.label ?? 'Freestyle session',
          targetMuscles: day?.targetMuscles ?? [],
          exercises: last
            ? last.exercises
                .filter((e) => e.sets.length > 0)
                .map((e) => ({
                  id: newId(),
                  exerciseId: e.exerciseId,
                  exerciseName: e.exerciseName,
                  sets: e.sets.map((s) => ({
                    id: newId(),
                    reps: s.reps,
                    weight: s.weight,
                    planned: true,
                  })),
                }))
            : [],
        }
        setSessions((prev) => [session, ...prev])
        setActiveSessionId(session.id)
        // Training after marking today skipped (changed your mind, or logged
        // the skip first thing in the morning) — the log shouldn't say both.
        const today = localDateKey()
        setSkippedDays((prev) => prev.filter((s) => s.date !== today))
        return session
      },

      confirmSet: (sessionId, loggedExerciseId, setId, done) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId
              ? s
              : {
                  ...s,
                  exercises: s.exercises.map((e) =>
                    e.id !== loggedExerciseId
                      ? e
                      : {
                          ...e,
                          sets: e.sets.map((set) =>
                            set.id !== setId ? set : { ...set, planned: done ? undefined : true },
                          ),
                        },
                  ),
                },
          ),
        )
      },

      confirmAllSets: (sessionId, loggedExerciseId) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId
              ? s
              : {
                  ...s,
                  exercises: s.exercises.map((e) =>
                    e.id !== loggedExerciseId
                      ? e
                      : { ...e, sets: e.sets.map((set) => ({ ...set, planned: undefined })) },
                  ),
                },
          ),
        )
      },

      addExerciseToSession: (sessionId, exerciseId, exerciseName) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId
              ? s
              : {
                  ...s,
                  exercises: [
                    ...s.exercises,
                    { id: newId(), exerciseId, exerciseName, sets: [] },
                  ],
                },
          ),
        )
      },

      removeExerciseFromSession: (sessionId, loggedExerciseId) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId
              ? s
              : { ...s, exercises: s.exercises.filter((e) => e.id !== loggedExerciseId) },
          ),
        )
      },

      addSet: (sessionId, loggedExerciseId, set) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId
              ? s
              : {
                  ...s,
                  exercises: s.exercises.map((e) =>
                    e.id !== loggedExerciseId
                      ? e
                      : { ...e, sets: [...e.sets, { ...set, id: newId() }] },
                  ),
                },
          ),
        )
      },

      updateSet: (sessionId, loggedExerciseId, setId, patch) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId
              ? s
              : {
                  ...s,
                  exercises: s.exercises.map((e) =>
                    e.id !== loggedExerciseId
                      ? e
                      : {
                          ...e,
                          sets: e.sets.map((set) =>
                            set.id !== setId ? set : { ...set, ...patch },
                          ),
                        },
                  ),
                },
          ),
        )
      },

      removeSet: (sessionId, loggedExerciseId, setId) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId
              ? s
              : {
                  ...s,
                  exercises: s.exercises.map((e) =>
                    e.id !== loggedExerciseId
                      ? e
                      : { ...e, sets: e.sets.filter((set) => set.id !== setId) },
                  ),
                },
          ),
        )
      },

      finishSession: (sessionId, plannedSets = 'discard') => {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== sessionId) return s
            const exercises =
              plannedSets === 'keep'
                ? s.exercises.map((e) => ({
                    ...e,
                    sets: e.sets.map((set) => ({ ...set, planned: undefined })),
                  }))
                : s.exercises
                    .map((e) => ({ ...e, sets: e.sets.filter((set) => !set.planned) }))
                    // Drop only exercises that were emptied by discarding their
                    // planned sets — one you added but never logged stays as it was.
                    .filter((e, i) => e.sets.length > 0 || s.exercises[i].sets.every((set) => !set.planned))
            return { ...s, exercises, completedAt: new Date().toISOString() }
          }),
        )
        setActiveSessionId((prev) => (prev === sessionId ? null : prev))
        markWorkoutToday()
      },

      deleteSession: (sessionId) => {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        setActiveSessionId((prev) => (prev === sessionId ? null : prev))
      },

      getExerciseHistory: (exerciseId, excludeSessionId) => {
        return sessions
          .filter((s) => s.id !== excludeSessionId && s.completedAt)
          .flatMap((session) =>
            session.exercises
              .filter((e) => e.exerciseId === exerciseId && e.sets.length > 0)
              .map((logged) => ({ session, logged })),
          )
          .sort((a, b) => b.session.date.localeCompare(a.session.date))
      },
    }),
    [
      split,
      sessions,
      activeSession,
      bodyWeightEntries,
      skippedDays,
      setSplit,
      setSessions,
      setActiveSessionId,
      setBodyWeightEntries,
      setSkippedDays,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
