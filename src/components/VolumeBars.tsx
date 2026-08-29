import { formatMuscle } from '../lib/exercises'

export function VolumeBars({ totals }: { totals: Record<string, number> }) {
  const rows = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)

  if (rows.length === 0) return null

  const max = rows[0][1]

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map(([muscle, value]) => (
        <div key={muscle}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span>{formatMuscle(muscle)}</span>
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {Math.round(value).toLocaleString()} kg
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full"
            style={{ background: 'var(--surface-2)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, (value / max) * 100)}%`,
                background: 'var(--accent)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
