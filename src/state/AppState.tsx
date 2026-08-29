import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { newId, usePersistedState } from '../lib/storage'
import { markWorkoutToday } from '../lib/sharedData'
import type {
  BodyWeightEntry,
  LoggedExercise,
  SetEntry,
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

  startSession: (day: SplitDay | null) => WorkoutSession
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
  finishSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void

  /** Most recent *other* logged instance of this exercise, most recent first. */
  getExerciseHistory: (exerciseId: string, excludeSessionId?: string) => Array<{
    session: WorkoutSession
    logged: LoggedExercise
  }>
}

const AppStateContext = createContext<AppStateValue | null>(null)

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

      startSession: (day: SplitDay | null) => {
        const session: WorkoutSession = {
          id: newId(),
          date: new Date().toISOString(),
          completedAt: null,
          splitDayId: day?.id ?? null,
          splitDayLabel: day?.label ?? 'Freestyle session',
          targetMuscles: day?.targetMuscles ?? [],
          exercises: [],
        }
        setSessions((prev) => [session, ...prev])
        setActiveSessionId(session.id)
        return session
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

      finishSession: (sessionId) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== sessionId ? s : { ...s, completedAt: new Date().toISOString() },
          ),
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
      setSplit,
      setSessions,
      setActiveSessionId,
      setBodyWeightEntries,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
