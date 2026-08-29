import { useMemo, useState } from 'react'
import { useAppState } from '../state/AppState'
import { HistoryTabs } from '../components/HistoryTabs'
import { WeightChart } from '../components/WeightChart'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10)
}

export function BodyWeight() {
  const { bodyWeightEntries, addBodyWeightEntry, removeBodyWeightEntry } = useAppState()
  const [date, setDate] = useState(todayDateInput())
  const [weight, setWeight] = useState('')

  const sorted = useMemo(
    () => [...bodyWeightEntries].sort((a, b) => a.date.localeCompare(b.date)),
    [bodyWeightEntries],
  )
  const descending = [...sorted].reverse()

  const change =
    sorted.length >= 2 ? sorted[sorted.length - 1].weightKg - sorted[0].weightKg : null

  function handleAdd() {
    const w = Number(weight)
    if (!w || w <= 0) return
    addBodyWeightEntry(new Date(date).toISOString(), w)
    setWeight('')
  }

  return (
    <div className="flex-1 p-4">
      <PageHeader title="History" subtitle="Bodyweight over time." />
      <HistoryTabs />

      <Card className="mb-4">
        <div className="mb-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs" style={{ color: 'var(--text-muted)' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs" style={{ color: 'var(--text-muted)' }}>
              Weight (kg)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            />
          </div>
          <Button variant="primary" onClick={handleAdd}>
            + Log
          </Button>
        </div>

        {sorted.length >= 2 && (
          <>
            <WeightChart entries={sorted} />
            <p className="mt-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              {change !== null && (
                <>
                  {change > 0 ? '+' : ''}
                  {change.toFixed(1)} kg since first log
                </>
              )}
            </p>
          </>
        )}
      </Card>

      {descending.length === 0 ? (
        <EmptyState>No bodyweight logged yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-1.5">
          {descending.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>
                {new Date(entry.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="font-medium">{entry.weightKg} kg</span>
              <button
                className="text-xs"
                style={{ color: 'var(--danger)' }}
                onClick={() => removeBodyWeightEntry(entry.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
