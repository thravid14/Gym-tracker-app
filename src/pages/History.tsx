import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { HistoryTabs } from '../components/HistoryTabs'
import { SkipForm } from '../components/SkipForm'
import { StreakCard } from '../components/StreakCard'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'
import { useCountUp } from '../hooks/useCountUp'
import { usePRs } from '../hooks/usePRs'
import { dateFromKey } from '../lib/dates'
import type { SkippedDay, WorkoutSession } from '../types'

function daysAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000
}

function StatCard({ label, value }: { label: string; value: number }) {
  const animated = useCountUp(value)
  return (
    <Card className="p-3">
      <p className="text-xl font-bold">{Math.round(animated)}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </Card>
  )
}

type Entry =
  | { kind: 'session'; at: number; session: WorkoutSession }
  | { kind: 'skip'; at: number; skip: SkippedDay }

export function History() {
  const { sessions, skippedDays, removeSkippedDay } = useAppState()
  const { setPRs } = usePRs()
  const navigate = useNavigate()
  const [showSkipForm, setShowSkipForm] = useState(false)

  const completed = useMemo(
    () => sessions.filter((s) => s.completedAt).sort((a, b) => b.date.localeCompare(a.date)),
    [sessions],
  )

  const stats = useMemo(
    () => ({
      total: completed.length,
      last7: completed.filter((s) => daysAgo(s.date) <= 7).length,
      last30: completed.filter((s) => daysAgo(s.date) <= 30).length,
      skipped7: skippedDays.filter((s) => daysAgo(dateFromKey(s.date).toISOString()) <= 7).length,
      skipped30: skippedDays.filter((s) => daysAgo(dateFromKey(s.date).toISOString()) <= 30).length,
    }),
    [completed, skippedDays],
  )

  // Workouts and skipped days on one timeline, newest first. A skipped day sorts
  // at local noon, so a same-day workout (started any time) never ties with it.
  const entries = useMemo<Entry[]>(
    () =>
      [
        ...completed.map((session): Entry => ({
          kind: 'session',
          at: new Date(session.date).getTime(),
          session,
        })),
        ...skippedDays.map((skip): Entry => ({
          kind: 'skip',
          at: dateFromKey(skip.date).getTime(),
          skip,
        })),
      ].sort((a, b) => b.at - a.at),
    [completed, skippedDays],
  )

  return (
    <div className="flex-1 p-4">
      <PageHeader title="History" subtitle="Your consistency log." />
      <HistoryTabs />

      <StreakCard className="mb-3" />

      <div className="mb-2 grid grid-cols-3 gap-2 text-center">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Last 7 days" value={stats.last7} />
        <StatCard label="Last 30 days" value={stats.last30} />
      </div>
      {(stats.skipped7 > 0 || stats.skipped30 > 0) && (
        <p className="mb-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Skipped: {stats.skipped7} in the last 7 days · {stats.skipped30} in the last 30
        </p>
      )}

      <div className="mb-3 mt-2">
        {showSkipForm ? (
          <SkipForm onDone={() => setShowSkipForm(false)} />
        ) : (
          <Button className="w-full" onClick={() => setShowSkipForm(true)}>
            + Log a skipped day
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyState>No completed sessions yet. Finish a workout and it'll show up here.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => {
            if (entry.kind === 'skip') {
              const { skip } = entry
              const detail = [skip.splitDayLabel, skip.reason].filter(Boolean).join(' · ')
              return (
                <Card
                  key={skip.id}
                  className="flex items-center justify-between"
                  style={{ borderStyle: 'dashed', background: 'transparent' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-muted)' }}>
                      Skipped
                    </p>
                    {detail && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {detail}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {dateFromKey(skip.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <button
                      aria-label="Remove skipped day"
                      className="px-1 text-xs"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => removeSkippedDay(skip.id)}
                    >
                      ✕
                    </button>
                  </div>
                </Card>
              )
            }

            const s = entry.session
            const totalSets = s.exercises.reduce((n, e) => n + e.sets.length, 0)
            const prCount = setPRs.get(s.id)?.size ?? 0
            return (
              <Card key={s.id} className="cursor-pointer" onClick={() => navigate(`/session/${s.id}`)}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{s.splitDayLabel}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(s.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {s.exercises.length} exercise{s.exercises.length === 1 ? '' : 's'} · {totalSets} sets
                  {prCount > 0 && (
                    <span className="font-semibold" style={{ color: '#eab308' }}>
                      {' · '}🏆 {prCount} PR{prCount === 1 ? '' : 's'}
                    </span>
                  )}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
