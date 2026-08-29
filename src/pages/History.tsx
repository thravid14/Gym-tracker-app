import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { HistoryTabs } from '../components/HistoryTabs'
import { Card, EmptyState, PageHeader } from '../components/ui'

function daysAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000
}

export function History() {
  const { sessions } = useAppState()
  const navigate = useNavigate()

  const completed = useMemo(
    () => sessions.filter((s) => s.completedAt).sort((a, b) => b.date.localeCompare(a.date)),
    [sessions],
  )

  const stats = useMemo(
    () => ({
      total: completed.length,
      last7: completed.filter((s) => daysAgo(s.date) <= 7).length,
      last30: completed.filter((s) => daysAgo(s.date) <= 30).length,
    }),
    [completed],
  )

  return (
    <div className="flex-1 p-4">
      <PageHeader title="History" subtitle="Your consistency log." />
      <HistoryTabs />

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Last 7 days', value: stats.last7 },
          { label: 'Last 30 days', value: stats.last30 },
        ].map((s) => (
          <Card key={s.label} className="p-3">
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {completed.length === 0 ? (
        <EmptyState>No completed sessions yet. Finish a workout and it'll show up here.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {completed.map((s) => {
            const totalSets = s.exercises.reduce((n, e) => n + e.sets.length, 0)
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
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
