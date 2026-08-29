import { useMemo, useState } from 'react'
import { useAppState } from '../state/AppState'
import { computeVolumeByMuscle } from '../lib/volume'
import { HistoryTabs } from '../components/HistoryTabs'
import { VolumeBars } from '../components/VolumeBars'
import { EmptyState, PageHeader } from '../components/ui'

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
]

export function Volume() {
  const { sessions } = useAppState()
  const [days, setDays] = useState(7)

  const totals = useMemo(() => computeVolumeByMuscle(sessions, days), [sessions, days])
  const hasAny = Object.values(totals).some((v) => v > 0)

  return (
    <div className="flex-1 p-4">
      <PageHeader title="History" subtitle="Volume lifted per muscle group." />
      <HistoryTabs />

      <div className="mb-4 flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              borderColor: days === r.days ? 'var(--accent)' : 'var(--border)',
              background: days === r.days ? 'var(--accent)' : 'transparent',
              color: days === r.days ? 'var(--accent-text)' : 'var(--text)',
            }}
          >
            Last {r.label}
          </button>
        ))}
      </div>

      {hasAny ? (
        <VolumeBars totals={totals} />
      ) : (
        <EmptyState>
          No completed sessions with logged weight in this window yet. Volume counts weight ×
          reps for each exercise's primary muscles.
        </EmptyState>
      )}
    </div>
  )
}
