import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { suggestNextSet } from '../lib/suggestions'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'
import { Celebration } from '../components/Celebration'
import type { LoggedExercise } from '../types'

function SetRow({
  sessionId,
  exerciseId,
  index,
  set,
}: {
  sessionId: string
  exerciseId: string
  index: number
  set: { id: string; reps: number; weight: number; planned?: boolean }
}) {
  const { updateSet, removeSet, confirmSet } = useAppState()
  const planned = !!set.planned
  return (
    <div className="flex items-center gap-2 text-sm" style={{ opacity: planned ? 0.65 : 1 }}>
      {/* Tick circle: shows the set number while still planned, a check once logged. */}
      <button
        aria-label={planned ? `Mark set ${index + 1} as done` : `Mark set ${index + 1} as not done`}
        aria-pressed={!planned}
        onClick={() => confirmSet(sessionId, exerciseId, set.id, planned)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
        style={{
          borderColor: planned ? 'var(--border)' : 'var(--accent)',
          background: planned ? 'transparent' : 'var(--accent)',
          color: planned ? 'var(--text-muted)' : 'var(--accent-text)',
        }}
      >
        {planned ? index + 1 : '✓'}
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={set.weight}
        onChange={(e) =>
          updateSet(sessionId, exerciseId, set.id, { weight: Number(e.target.value) })
        }
        className="w-20 rounded-md border px-2 py-1"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      />
      <span style={{ color: 'var(--text-muted)' }}>kg ×</span>
      <input
        type="number"
        inputMode="numeric"
        value={set.reps}
        onChange={(e) =>
          updateSet(sessionId, exerciseId, set.id, { reps: Number(e.target.value) })
        }
        className="w-16 rounded-md border px-2 py-1"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      />
      <span style={{ color: 'var(--text-muted)' }}>reps</span>
      <button
        aria-label={`Remove set ${index + 1}`}
        className="ml-auto px-1 text-xs"
        style={{ color: 'var(--danger)' }}
        onClick={() => removeSet(sessionId, exerciseId, set.id)}
      >
        ✕
      </button>
    </div>
  )
}

function ExerciseBlock({ sessionId, logged }: { sessionId: string; logged: LoggedExercise }) {
  const { addSet, removeExerciseFromSession, getExerciseHistory, confirmAllSets } = useAppState()
  const navigate = useNavigate()
  const hasPlanned = logged.sets.some((s) => s.planned)
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const weightInputRef = useRef<HTMLInputElement>(null)
  const repsInputRef = useRef<HTMLInputElement>(null)

  const history = getExerciseHistory(logged.exerciseId, sessionId)
  const last = history[0]
  const suggestion = last ? suggestNextSet(last.logged.sets) : null

  function handleAddSet() {
    const r = Number(reps)
    const w = Number(weight)
    if (!r) return
    addSet(sessionId, logged.id, { reps: r, weight: w || 0 })
    setReps('')
    setWeight('')
    // Back to weight, ready for the next set — logging several sets in a
    // row shouldn't need re-tapping into the field each time.
    weightInputRef.current?.focus()
  }

  function repeatLast() {
    if (!last) return
    for (const s of last.logged.sets) {
      addSet(sessionId, logged.id, { reps: s.reps, weight: s.weight })
    }
  }

  function tryIt() {
    if (!suggestion) return
    addSet(sessionId, logged.id, { reps: suggestion.reps, weight: suggestion.weight })
  }

  return (
    <Card>
      <div className="mb-2 flex items-start justify-between">
        <button
          className="text-left font-medium underline decoration-dotted"
          onClick={() => navigate(`/history/exercise/${logged.exerciseId}`)}
        >
          {logged.exerciseName}
        </button>
        <button
          className="text-xs"
          style={{ color: 'var(--danger)' }}
          onClick={() => removeExerciseFromSession(sessionId, logged.id)}
        >
          Remove
        </button>
      </div>

      {last && (
        <p className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Last time: {last.logged.sets.map((s) => `${s.weight}×${s.reps}`).join(', ')}
          {/* Planned sets already are last time's numbers — Repeat would double them. */}
          {!hasPlanned && (
            <>
              {' · '}
              <button className="underline" onClick={repeatLast}>
                Repeat
              </button>
            </>
          )}
        </p>
      )}

      {suggestion && (
        <p className="mb-2 text-xs" style={{ color: 'var(--accent)' }}>
          Suggested: {suggestion.weight}kg × {suggestion.reps} ({suggestion.label})
          {' · '}
          <button className="underline" onClick={tryIt}>
            Try it
          </button>
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {logged.sets.map((s, i) => (
          <SetRow key={s.id} sessionId={sessionId} exerciseId={logged.id} index={i} set={s} />
        ))}
      </div>

      {hasPlanned && (
        <button
          className="mt-2 text-xs font-semibold underline"
          style={{ color: 'var(--accent)' }}
          onClick={() => confirmAllSets(sessionId, logged.id)}
        >
          ✓ Tick all sets as done
        </button>
      )}

      <div className="mt-2 flex items-center gap-2 text-sm">
        <input
          ref={weightInputRef}
          type="number"
          inputMode="decimal"
          enterKeyHint="next"
          placeholder="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              repsInputRef.current?.focus()
            }
          }}
          className="w-20 rounded-md border px-2 py-1"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        />
        <span style={{ color: 'var(--text-muted)' }}>×</span>
        <input
          ref={repsInputRef}
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddSet()
            }
          }}
          className="w-16 rounded-md border px-2 py-1"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        />
        <Button variant="primary" className="ml-auto" onClick={handleAddSet}>
          + Set
        </Button>
      </div>
    </Card>
  )
}

export function Session() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { sessions, finishSession, deleteSession } = useAppState()
  const navigate = useNavigate()
  const [celebrateFire, setCelebrateFire] = useState(0)
  const [askAboutPlanned, setAskAboutPlanned] = useState(false)

  const session = sessions.find((s) => s.id === sessionId)

  if (!session) {
    return (
      <div className="flex-1 p-4">
        <EmptyState>
          Session not found. <button className="underline" onClick={() => navigate('/')}>Go home</button>
        </EmptyState>
      </div>
    )
  }

  const allSets = session.exercises.flatMap((e) => e.sets)
  const plannedCount = allSets.filter((s) => s.planned).length
  const doneCount = allSets.length - plannedCount

  function complete(plannedSets: 'keep' | 'discard') {
    finishSession(session!.id, plannedSets)
    setCelebrateFire((f) => f + 1)
    // Brief pause so the celebration is actually visible before
    // navigating away, rather than firing and immediately unmounting.
    setTimeout(() => navigate('/history'), 700)
  }

  return (
    <div className="flex-1 p-4">
      <Celebration fire={celebrateFire} />
      <PageHeader
        showBack
        title={session.splitDayLabel}
        subtitle={`${new Date(session.date).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })} · ${session.exercises.length} exercise${session.exercises.length === 1 ? '' : 's'} · ${doneCount} set${doneCount === 1 ? '' : 's'}${
          plannedCount > 0 ? ` · ${plannedCount} to tick off` : ''
        }${session.completedAt ? ' · Completed' : ''}`}
      />

      <Button variant="primary" className="mb-3 w-full" onClick={() => navigate(`/session/${session.id}/add`)}>
        + Add exercise
      </Button>

      {session.exercises.length === 0 ? (
        <EmptyState>No exercises yet — add one to get started.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {session.exercises.map((logged) => (
            <ExerciseBlock key={logged.id} sessionId={session.id} logged={logged} />
          ))}
        </div>
      )}

      {askAboutPlanned && !session.completedAt && (
        <Card className="mt-5" style={{ borderColor: 'var(--accent)' }}>
          <p className="mb-1 text-sm font-medium">
            {plannedCount} set{plannedCount === 1 ? '' : 's'} not ticked off
          </p>
          <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {doneCount > 0
              ? 'Count them as done, or leave them out of this workout?'
              : "You haven't ticked off anything yet."}
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={() => complete('keep')}>
              Count them as done
            </Button>
            {doneCount > 0 ? (
              <Button onClick={() => complete('discard')}>Leave them out</Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => {
                  deleteSession(session.id)
                  navigate('/')
                }}
              >
                Discard this session
              </Button>
            )}
            <Button variant="ghost" onClick={() => setAskAboutPlanned(false)}>
              Keep going
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-5 flex gap-2">
        {!session.completedAt && !askAboutPlanned && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => (plannedCount > 0 ? setAskAboutPlanned(true) : complete('discard'))}
          >
            Finish session
          </Button>
        )}
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Delete this session? This cannot be undone.')) {
              deleteSession(session.id)
              navigate('/history')
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
