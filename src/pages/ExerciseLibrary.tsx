import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { allEquipment, allMuscles, formatMuscle, useExerciseLibrary } from '../lib/exercises'
import { ExerciseBrowser } from '../components/ExerciseBrowser'
import { Button, Card, PageHeader } from '../components/ui'

function AddCustomExerciseForm({
  onAdd,
  onDone,
}: {
  onAdd: (input: {
    name: string
    primaryMuscles: string[]
    secondaryMuscles: string[]
    equipment: string | null
    instructions: string[]
  }) => void
  onDone: () => void
}) {
  const [name, setName] = useState('')
  const [primary, setPrimary] = useState<string[]>([])
  const [secondary, setSecondary] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string | null>(null)
  const [instructions, setInstructions] = useState('')

  const canSubmit = name.trim().length > 0 && primary.length > 0

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function handleSubmit() {
    if (!canSubmit) return
    onAdd({
      name: name.trim(),
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      equipment,
      instructions: instructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    })
    onDone()
  }

  return (
    <Card className="mb-4 p-3">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Cable Y-Raise"
        className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      />

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Primary muscle{primary.length > 0 ? ` (${primary.length})` : ' — required'}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {allMuscles.map((m) => {
          const selected = primary.includes(m)
          return (
            <button
              key={m}
              onClick={() => toggle(primary, setPrimary, m)}
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

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Secondary muscles (optional)
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {allMuscles.map((m) => {
          const selected = secondary.includes(m)
          return (
            <button
              key={m}
              onClick={() => toggle(secondary, setSecondary, m)}
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

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Equipment (optional)
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {allEquipment.map((eq) => {
          const selected = equipment === eq
          return (
            <button
              key={eq}
              onClick={() => setEquipment(selected ? null : eq)}
              className="rounded-full border px-2.5 py-1 text-xs capitalize"
              style={{
                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                background: selected ? 'var(--accent)' : 'transparent',
                color: selected ? 'var(--accent-text)' : 'var(--text)',
              }}
            >
              {eq}
            </button>
          )
        })}
      </div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Instructions (optional, one step per line)
      </label>
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={3}
        className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      />

      <div className="flex gap-2">
        <Button className="flex-1" onClick={onDone}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={!canSubmit}>
          Add exercise
        </Button>
      </div>
    </Card>
  )
}

export function ExerciseLibrary() {
  const {
    all,
    hiddenExercises,
    favoriteIds,
    removeCustomExercise,
    addCustomExercise,
    hideExercise,
    unhideExercise,
    toggleFavorite,
  } = useExerciseLibrary()
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex-1 p-4">
      <PageHeader title="Exercises" subtitle="Search the library, or add your own." />

      {showForm ? (
        <AddCustomExerciseForm onAdd={addCustomExercise} onDone={() => setShowForm(false)} />
      ) : (
        <Button variant="primary" className="mb-4 w-full" onClick={() => setShowForm(true)}>
          + Add a custom exercise
        </Button>
      )}

      {hiddenExercises.length > 0 && (
        <details className="mb-4">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Hidden exercises ({hiddenExercises.length})
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {hiddenExercises.map((ex) => (
              <Card key={ex.id} className="flex items-center justify-between gap-2 p-2.5">
                <span className="text-sm">{ex.name}</span>
                <Button className="shrink-0 text-xs" onClick={() => unhideExercise(ex.id)}>
                  Unhide
                </Button>
              </Card>
            ))}
          </div>
        </details>
      )}

      <ExerciseBrowser
        exercises={all}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        renderAction={(ex) => (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Button className="text-xs" onClick={() => navigate(`/history/exercise/${ex.id}`)}>
              History
            </Button>
            {ex.id.startsWith('custom-') ? (
              <button
                className="text-xs"
                style={{ color: 'var(--danger)' }}
                onClick={() => removeCustomExercise(ex.id)}
              >
                Remove
              </button>
            ) : (
              <button
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => hideExercise(ex.id)}
              >
                Hide
              </button>
            )}
          </div>
        )}
      />
    </div>
  )
}
