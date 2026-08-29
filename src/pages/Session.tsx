import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { suggestNextSet } from '../lib/suggestions'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'
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
  set: { id: string; reps: number; weight: number }
}) {
  const { updateSet, removeSet } = useAppState()
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-5 shrink-0 text-center" style={{ color: 'var(--text-muted)' }}>
        {index + 1}
      </span>
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
        className="ml-auto text-xs"
        style={{ color: 'var(--danger)' }}
        onClick={() => removeSet(sessionId, exerciseId, set.id)}
      >
        Remove
      </button>
    </div>
  )
}

function ExerciseBlock({ sessionId, logged }: { sessionId: string; logged: LoggedExercise }) {
  const { addSet, removeExerciseFromSession, getExerciseHistory } = useAppState()
  const navigate = useNavigate()
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')

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
          {' · '}
          <button className="underline" onClick={repeatLast}>
            Repeat
          </button>
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

      <div className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="number"
          inputMode="decimal"
          placeholder="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-20 rounded-md border px-2 py-1"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        />
        <span style={{ color: 'var(--text-muted)' }}>×</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
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

  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0)

  return (
    <div className="flex-1 p-4">
      <PageHeader
        title={session.splitDayLabel}
        subtitle={`${new Date(session.date).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })} · ${session.exercises.length} exercises · ${totalSets} sets${
          session.completedAt ? ' · Completed' : ''
        }`}
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

      <div className="mt-5 flex gap-2">
        {!session.completedAt && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              finishSession(session.id)
              navigate('/history')
            }}
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
