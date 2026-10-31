import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePRs } from '../hooks/usePRs'
import { HistoryTabs } from '../components/HistoryTabs'
import { Card, EmptyState, PageHeader } from '../components/ui'

const NEW_WINDOW_DAYS = 7

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function isRecent(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() <= NEW_WINDOW_DAYS * 86_400_000
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function Records() {
  const { records } = usePRs()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? records.filter((r) => r.exerciseName.toLowerCase().includes(q)) : records
  }, [records, search])

  return (
    <div className="flex-1 p-4">
      <PageHeader title="History" subtitle="Your personal records." />
      <HistoryTabs />

      {records.length === 0 ? (
        <EmptyState>
          No records yet — log some sets with weight and your bests will show up here.
        </EmptyState>
      ) : (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          />
          <p className="mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            {shown.length} exercise{shown.length === 1 ? '' : 's'} · newest records first
          </p>

          <div className="flex flex-col gap-2">
            {shown.map((r) => (
              <Card
                key={r.exerciseId}
                className="cursor-pointer"
                onClick={() => navigate(`/history/exercise/${r.exerciseId}`)}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <p className="min-w-0 break-words font-medium">{r.exerciseName}</p>
                  {isRecent(r.lastRecordAt) && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                    >
                      🏆 New
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 text-sm">
                  {r.weight && (
                    <div className="flex justify-between gap-2">
                      <span style={{ color: 'var(--text-muted)' }}>Heaviest</span>
                      <span>
                        <strong>{r.weight.weight} kg</strong> × {r.weight.reps}
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(r.weight.date)}
                        </span>
                      </span>
                    </div>
                  )}
                  {r.e1rm && (
                    <div className="flex justify-between gap-2">
                      <span style={{ color: 'var(--text-muted)' }}>Est. 1RM</span>
                      <span>
                        <strong>{round1(r.e1rm.e1rm)} kg</strong>
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(r.e1rm.date)}
                        </span>
                      </span>
                    </div>
                  )}
                  {r.reps && (
                    <div className="flex justify-between gap-2">
                      <span style={{ color: 'var(--text-muted)' }}>Most reps (bodyweight)</span>
                      <span>
                        <strong>{r.reps.reps}</strong>
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(r.reps.date)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {shown.length === 0 && <EmptyState>No exercises match that search.</EmptyState>}
        </>
      )}
    </div>
  )
}
