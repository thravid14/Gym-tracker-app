import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { useExerciseLibrary } from '../lib/exercises'
import { ExerciseBrowser } from '../components/ExerciseBrowser'
import { Button, EmptyState, PageHeader } from '../components/ui'

export function ExercisePicker() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { sessions, addExerciseToSession } = useAppState()
  const { all } = useExerciseLibrary()
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

  const addedIds = new Set(session.exercises.map((e) => e.exerciseId))

  return (
    <div className="flex-1 p-4 pb-2">
      <PageHeader showBack title="Add exercise" subtitle={`For: ${session.splitDayLabel}`} />

      <ExerciseBrowser
        exercises={all}
        initialMuscles={session.targetMuscles}
        renderAction={(ex) => {
          const added = addedIds.has(ex.id)
          return (
            <Button
              variant={added ? 'secondary' : 'primary'}
              className="shrink-0"
              onClick={() => addExerciseToSession(session.id, ex.id, ex.name)}
            >
              {added ? '+ Add again' : '+ Add'}
            </Button>
          )
        }}
      />

      <div className="sticky bottom-2 mt-4">
        <Button variant="primary" className="w-full" onClick={() => navigate(`/session/${session.id}`)}>
          Done ({session.exercises.length} in session)
        </Button>
      </div>
    </div>
  )
}
