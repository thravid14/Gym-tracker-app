import type { BodyWeightEntry } from '../types'

const WIDTH = 400
const HEIGHT = 160
const PAD_X = 12
const PAD_Y = 16

export function WeightChart({ entries }: { entries: BodyWeightEntry[] }) {
  if (entries.length < 2) return null

  const values = entries.map((e) => e.weightKg)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const times = entries.map((e) => new Date(e.date).getTime())
  const minT = times[0]
  const maxT = times[times.length - 1]
  const timeRange = maxT - minT || 1

  const x = (t: number) => PAD_X + ((t - minT) / timeRange) * (WIDTH - PAD_X * 2)
  const y = (v: number) => HEIGHT - PAD_Y - ((v - min) / range) * (HEIGHT - PAD_Y * 2)

  const points = entries.map((e) => ({ x: x(new Date(e.date).getTime()), y: y(e.weightKg), e }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const first = entries[0]
  const last = entries[entries.length - 1]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ height: 160 }}>
      {/* baseline */}
      <line
        x1={PAD_X}
        y1={HEIGHT - PAD_Y}
        x2={WIDTH - PAD_X}
        y2={HEIGHT - PAD_Y}
        stroke="var(--border)"
        strokeWidth={1}
      />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--accent)">
          <title>
            {new Date(p.e.date).toLocaleDateString()}: {p.e.weightKg} kg
          </title>
        </circle>
      ))}
      <text x={PAD_X} y={12} fontSize={10} fill="var(--text-muted)">
        {first.weightKg} kg
      </text>
      <text x={WIDTH - PAD_X} y={12} fontSize={10} fill="var(--text-muted)" textAnchor="end">
        {last.weightKg} kg
      </text>
    </svg>
  )
}
