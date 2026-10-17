import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { formatMuscle } from '../lib/exercises'
import { localDateKey } from '../lib/dates'
import { SkipForm } from '../components/SkipForm'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'

export function Today() {
  const {
    split,
    activeSession,
    sessions,
    startSession,
    getLastSessionForDay,
    skippedDays,
    removeSkippedDay,
  } = useAppState()
  const navigate = useNavigate()
  const [showSkipForm, setShowSkipForm] = useState(false)

  const skippedToday = skippedDays.find((s) => s.date === localDateKey())

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const lastCompleted = sessions.find((s) => s.completedAt)

  return (
    <div className="flex-1 p-4">
      <PageHeader title="Today" subtitle={todayLabel} />

      {activeSession && (
        <Card className="mb-4" style={{ borderColor: 'var(--accent)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
            In progress
          </p>
          <p className="mt-1 font-medium">{activeSession.splitDayLabel}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {activeSession.exercises.length} exercise{activeSession.exercises.length === 1 ? '' : 's'} in this session
          </p>
          <Button
            variant="primary"
            className="mt-3 w-full"
            onClick={() => navigate(`/session/${activeSession.id}`)}
          >
            Resume session
          </Button>
        </Card>
      )}

      {!activeSession && (!split || split.days.length === 0) && (
        <EmptyState>
          <p className="mb-3">You haven't set up a split yet.</p>
          <Button variant="primary" onClick={() => navigate('/split')}>
            Set up your split
          </Button>
        </EmptyState>
      )}

      {!activeSession && split && split.days.length > 0 && (
        <>
          <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            What are you training today?
          </p>
          <div className="flex flex-col gap-2">
            {split.days.map((day) => {
              const last = getLastSessionForDay(day)
              const lastCount = last ? last.exercises.filter((e) => e.sets.length > 0).length : 0
              return (
                <Card
                  key={day.id}
                  className="cursor-pointer"
                  onClick={() => {
                    const session = startSession(day)
                    navigate(`/session/${session.id}`)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{day.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {day.targetMuscles.length > 0
                          ? day.targetMuscles.map(formatMuscle).join(', ')
                          : 'No target muscles set'}
                      </p>
                    </div>
                    <span style={{ color: 'var(--accent)' }}>→</span>
                  </div>
                  {last && (
                    <div
                      className="mt-2 flex items-center justify-between border-t pt-2 text-xs"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      <span>
                        Starts with your{' '}
                        {new Date(last.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        session · {lastCount} exercise{lastCount === 1 ? '' : 's'}
                      </span>
                      <button
                        className="underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          const session = startSession(day, false)
                          navigate(`/session/${session.id}`)
                        }}
                      >
                        Start blank
                      </button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      {!activeSession && (
        <button
          className="mt-4 w-full text-center text-sm underline"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => {
            const session = startSession(null)
            navigate(`/session/${session.id}`)
          }}
        >
          Or start a freestyle session (no split day)
        </button>
      )}

      {!activeSession && skippedToday && (
        <Card className="mt-4 flex items-center justify-between" style={{ borderStyle: 'dashed' }}>
          <div>
            <p className="text-sm font-medium">Today marked as skipped</p>
            {(skippedToday.splitDayLabel || skippedToday.reason) && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {[skippedToday.splitDayLabel, skippedToday.reason].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <button
            className="text-xs underline"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => removeSkippedDay(skippedToday.id)}
          >
            Undo
          </button>
        </Card>
      )}

      {!activeSession && !skippedToday && !showSkipForm && (
        <button
          className="mt-2 w-full text-center text-sm underline"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => setShowSkipForm(true)}
        >
          Not training today? Log a skipped day
        </button>
      )}

      {!activeSession && showSkipForm && (
        <div className="mt-4">
          <SkipForm onDone={() => setShowSkipForm(false)} />
        </div>
      )}

      {lastCompleted && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Last session
          </p>
          <Card
            className="cursor-pointer"
            onClick={() => navigate(`/session/${lastCompleted.id}`)}
          >
            <p className="font-medium">{lastCompleted.splitDayLabel}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(lastCompleted.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              {' · '}
              {lastCompleted.exercises.length} exercise{lastCompleted.exercises.length === 1 ? '' : 's'}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
