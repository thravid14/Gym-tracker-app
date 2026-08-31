import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { allEquipment, allMuscles, filterExercises, formatMuscle } from '../lib/exercises'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'

const PAGE_SIZE = 25

export function ExercisePicker() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { sessions, addExerciseToSession } = useAppState()
  const navigate = useNavigate()

  const session = sessions.find((s) => s.id === sessionId)

  const [muscles, setMuscles] = useState<string[]>(() => session?.targetMuscles ?? [])
  const [equipment, setEquipment] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const results = useMemo(
    () => filterExercises({ muscles, equipment, search }),
    [muscles, equipment, search],
  )

  if (!session) {
    return (
      <div className="flex-1 p-4">
        <EmptyState>
          Session not found. <button className="underline" onClick={() => navigate('/')}>Go home</button>
        </EmptyState>
      </div>
    )
  }

  const addedIds = new Set(session.exercises.map((e) => e.exerciseId))

  function toggleMuscle(m: string) {
    setMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
    setVisible(PAGE_SIZE)
  }

  function toggleEquipment(eq: string) {
    setEquipment((prev) => (prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq]))
    setVisible(PAGE_SIZE)
  }

  return (
    <div className="flex-1 p-4 pb-2">
      <PageHeader showBack title="Add exercise" subtitle={`For: ${session.splitDayLabel}`} />

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setVisible(PAGE_SIZE)
        }}
        placeholder="Search exercises…"
        className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      />

      <details className="mb-3" open={muscles.length > 0}>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Muscle group {muscles.length > 0 ? `(${muscles.length})` : ''}
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {allMuscles.map((m) => {
            const selected = muscles.includes(m)
            return (
              <button
                key={m}
                onClick={() => toggleMuscle(m)}
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
      </details>

      <details className="mb-4">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Equipment {equipment.length > 0 ? `(${equipment.length})` : ''}
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {allEquipment.map((eq) => {
            const selected = equipment.includes(eq)
            return (
              <button
                key={eq}
                onClick={() => toggleEquipment(eq)}
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
      </details>

      <p className="mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        {results.length} exercise{results.length === 1 ? '' : 's'}
      </p>

      <div className="flex flex-col gap-2">
        {results.slice(0, visible).map((ex) => {
          const added = addedIds.has(ex.id)
          const expanded = expandedId === ex.id
          return (
            <Card key={ex.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <button className="flex-1 text-left" onClick={() => setExpandedId(expanded ? null : ex.id)}>
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                    {ex.primaryMuscles.map(formatMuscle).join(', ')}
                    {ex.equipment ? ` · ${ex.equipment}` : ''}
                  </p>
                </button>
                <Button
                  variant={added ? 'secondary' : 'primary'}
                  className="shrink-0"
                  onClick={() => addExerciseToSession(session.id, ex.id, ex.name)}
                >
                  {added ? '+ Add again' : '+ Add'}
                </Button>
              </div>
              {expanded && ex.instructions.length > 0 && (
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {ex.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </Card>
          )
        })}
      </div>

      {visible < results.length && (
        <Button className="mt-3 w-full" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
          Show more
        </Button>
      )}

      {results.length === 0 && <EmptyState>No exercises match these filters.</EmptyState>}

      <div className="sticky bottom-2 mt-4">
        <Button variant="primary" className="w-full" onClick={() => navigate(`/session/${session.id}`)}>
          Done ({session.exercises.length} in session)
        </Button>
      </div>
    </div>
  )
}
