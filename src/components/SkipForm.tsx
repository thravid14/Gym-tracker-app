import { useState } from 'react'
import { useAppState } from '../state/AppState'
import { localDateKey } from '../lib/dates'
import { Button, Card } from './ui'

const REASONS = ['Rest day', 'Sick', 'Busy', 'Travel', 'Low energy']

/** Logs a day you didn't train. Defaults to today; pick an earlier date to backfill a missed one. */
export function SkipForm({
  initialDate,
  onDone,
}: {
  initialDate?: string
  onDone: () => void
}) {
  const { split, addSkippedDay } = useAppState()
  const [date, setDate] = useState(initialDate ?? localDateKey())
  const [dayId, setDayId] = useState('')
  const [reason, setReason] = useState('')

  function handleSave() {
    if (!date) return
    const day = split?.days.find((d) => d.id === dayId) ?? null
    addSkippedDay({
      date,
      splitDayId: day?.id ?? null,
      splitDayLabel: day?.label ?? null,
      reason: reason.trim(),
    })
    onDone()
  }

  return (
    <Card>
      <p className="mb-3 text-sm font-medium">Log a day you didn't train</p>

      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs" style={{ color: 'var(--text-muted)' }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            max={localDateKey()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          />
        </div>
        {split && split.days.length > 0 && (
          <div className="flex-1">
            <label className="mb-1 block text-xs" style={{ color: 'var(--text-muted)' }}>
              Which day (optional)
            </label>
            <select
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <option value="">—</option>
              {split.days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <label className="mb-1 block text-xs" style={{ color: 'var(--text-muted)' }}>
        Reason (optional)
      </label>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. sick, busy at work"
        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {REASONS.map((r) => {
          const selected = reason === r
          return (
            <button
              key={r}
              onClick={() => setReason(selected ? '' : r)}
              className="rounded-full border px-2.5 py-1 text-xs"
              style={{
                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                background: selected ? 'var(--accent)' : 'transparent',
                color: selected ? 'var(--accent-text)' : 'var(--text)',
              }}
            >
              {r}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" onClick={handleSave}>
          Save
        </Button>
        <Button onClick={onDone}>Cancel</Button>
      </div>
    </Card>
  )
}
