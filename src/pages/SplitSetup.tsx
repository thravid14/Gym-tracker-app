import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { allMuscles, formatMuscle } from '../lib/exercises'
import { newId } from '../lib/storage'
import { Button, Card, PageHeader } from '../components/ui'
import type { Split, SplitDay } from '../types'

const PRESETS: Record<string, Array<{ label: string; targetMuscles: string[] }>> = {
  'Push / Pull / Legs': [
    { label: 'Push', targetMuscles: ['chest', 'shoulders', 'triceps'] },
    { label: 'Pull', targetMuscles: ['lats', 'middle back', 'biceps', 'traps'] },
    { label: 'Legs', targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'] },
  ],
  'Upper / Lower': [
    { label: 'Upper', targetMuscles: ['chest', 'shoulders', 'triceps', 'lats', 'biceps'] },
    { label: 'Lower', targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'] },
  ],
  'Bro Split': [
    { label: 'Chest', targetMuscles: ['chest'] },
    { label: 'Back', targetMuscles: ['lats', 'middle back', 'traps'] },
    { label: 'Shoulders', targetMuscles: ['shoulders'] },
    { label: 'Arms', targetMuscles: ['biceps', 'triceps', 'forearms'] },
    { label: 'Legs', targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'] },
  ],
}

function emptyDay(): SplitDay {
  return { id: newId(), label: '', targetMuscles: [] }
}

export function SplitSetup() {
  const { split, saveSplit } = useAppState()
  const navigate = useNavigate()

  const [name, setName] = useState(split?.name ?? 'My Split')
  const [days, setDays] = useState<SplitDay[]>(
    split && split.days.length > 0 ? split.days : [emptyDay()],
  )

  function applyPreset(preset: string) {
    setDays(PRESETS[preset].map((d) => ({ id: newId(), ...d })))
  }

  function updateDay(id: string, patch: Partial<SplitDay>) {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function toggleMuscle(dayId: string, muscle: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.id !== dayId
          ? d
          : {
              ...d,
              targetMuscles: d.targetMuscles.includes(muscle)
                ? d.targetMuscles.filter((m) => m !== muscle)
                : [...d.targetMuscles, muscle],
            },
      ),
    )
  }

  function removeDay(id: string) {
    setDays((prev) => prev.filter((d) => d.id !== id))
  }

  function handleSave() {
    const cleaned = days
      .map((d) => ({ ...d, label: d.label.trim() || 'Untitled day' }))
      .filter((d) => d.targetMuscles.length > 0 || d.label !== 'Untitled day')
    const newSplit: Split = { id: split?.id ?? newId(), name: name.trim() || 'My Split', days: cleaned }
    saveSplit(newSplit)
    navigate('/')
  }

  return (
    <div className="flex-1 p-4">
      <PageHeader title="Split setup" subtitle="Define the days you actually run, and which muscles each targets." />

      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Split name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        placeholder="e.g. Push Pull Legs"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(PRESETS).map((preset) => (
          <Button key={preset} className="text-xs" onClick={() => applyPreset(preset)}>
            Use {preset}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day, i) => (
          <Card key={day.id}>
            <div className="mb-2 flex items-center gap-2">
              <input
                value={day.label}
                onChange={(e) => updateDay(day.id, { label: e.target.value })}
                placeholder={`Day ${i + 1} label, e.g. "Push"`}
                className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
              />
              <Button variant="danger" onClick={() => removeDay(day.id)} aria-label="Remove day">
                ✕
              </Button>
            </div>
            <p className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Target muscles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allMuscles.map((m) => {
                const selected = day.targetMuscles.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMuscle(day.id, m)}
                    className="rounded-full border px-2.5 py-1 text-xs"
                    style={{
                      borderColor: selected ? 'var(--accent)' : 'var(--border)',
                      background: selected ? 'var(--accent)' : 'transparent',
                      color: selected ? 'var(--accent-text)' : 'var(--text)',
                    }}
                  >
                    {formatMuscle(m)}
                  </button>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      <Button className="mt-3 w-full" onClick={() => setDays((prev) => [...prev, emptyDay()])}>
        + Add day
      </Button>

      <Button variant="primary" className="mt-4 w-full" onClick={handleSave}>
        Save split
      </Button>
    </div>
  )
}
