import { useMemo, useState, type ReactNode } from 'react'
import { allEquipment, allMuscles, exerciseImageUrls, filterExercises, formatMuscle } from '../lib/exercises'
import { Card, Button } from './ui'
import type { Exercise } from '../types'

const PAGE_SIZE = 25

interface ExerciseBrowserProps {
  exercises: Exercise[]
  initialMuscles?: string[]
  /** Trailing action button for each result card (e.g. "+ Add" in a picker, "Remove" for a custom exercise). */
  renderAction: (exercise: Exercise) => ReactNode
}

/**
 * Shared search/filter/results UI used by both the in-session exercise
 * picker and the standalone exercise library — same filtering logic, only
 * the per-result action button differs.
 */
export function ExerciseBrowser({ exercises, initialMuscles, renderAction }: ExerciseBrowserProps) {
  const [muscles, setMuscles] = useState<string[]>(initialMuscles ?? [])
  const [equipment, setEquipment] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const results = useMemo(
    () => filterExercises(exercises, { muscles, equipment, search }),
    [exercises, muscles, equipment, search],
  )

  function toggleMuscle(m: string) {
    setMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
    setVisible(PAGE_SIZE)
  }

  function toggleEquipment(eq: string) {
    setEquipment((prev) => (prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq]))
    setVisible(PAGE_SIZE)
  }

  return (
    <>
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
          const expanded = expandedId === ex.id
          const images = exerciseImageUrls(ex)
          return (
            <Card key={ex.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <button
                  className="flex flex-1 items-center gap-3 text-left"
                  onClick={() => setExpandedId(expanded ? null : ex.id)}
                >
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt=""
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      style={{ background: 'var(--surface-2)' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : ex.id.startsWith('custom-') ? (
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-xs"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                    >
                      Custom
                    </span>
                  ) : null}
                  <div>
                    <p className="font-medium">{ex.name}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                      {ex.primaryMuscles.map(formatMuscle).join(', ')}
                      {ex.equipment ? ` · ${ex.equipment}` : ''}
                    </p>
                  </div>
                </button>
                {renderAction(ex)}
              </div>
              {expanded && (
                <>
                  {images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {images.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          loading="lazy"
                          className="h-32 flex-1 rounded-lg object-cover"
                          style={{ background: 'var(--surface-2)' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {ex.instructions.length > 0 && (
                    <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {ex.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  )}
                </>
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

      {results.length === 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No exercises match these filters.
        </p>
      )}
    </>
  )
}
