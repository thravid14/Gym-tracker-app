import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { getExerciseById, exerciseImageUrls, formatMuscle } from '../lib/exercises'
import { Card, EmptyState, PageHeader } from '../components/ui'

export function ExerciseHistory() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const { getExerciseHistory } = useAppState()
  const navigate = useNavigate()

  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined
  const history = exerciseId ? getExerciseHistory(exerciseId) : []

  if (!exercise) {
    return (
      <div className="flex-1 p-4">
        <EmptyState>
          Exercise not found. <button className="underline" onClick={() => navigate('/history')}>Back</button>
        </EmptyState>
      </div>
    )
  }

  const best = history
    .flatMap((h) => h.logged.sets)
    .reduce((max, s) => (s.weight > max ? s.weight : max), 0)

  const images = exerciseImageUrls(exercise)

  return (
    <div className="flex-1 p-4">
      <PageHeader
        showBack
        title={exercise.name}
        subtitle={`${exercise.primaryMuscles.map(formatMuscle).join(', ')}${
          exercise.equipment ? ` · ${exercise.equipment}` : ''
        }`}
      />

      {images.length > 0 && (
        <div className="mb-4 flex gap-2">
          {images.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="h-40 flex-1 rounded-lg object-cover"
              style={{ background: 'var(--surface-2)' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ))}
        </div>
      )}

      {best > 0 && (
        <Card className="mb-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Best weight logged
          </p>
          <p className="text-xl font-bold">{best} kg</p>
        </Card>
      )}

      {history.length === 0 ? (
        <EmptyState>No completed sessions with this exercise yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map(({ session, logged }) => (
            <Card key={logged.id} className="cursor-pointer" onClick={() => navigate(`/session/${session.id}`)}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(session.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm font-medium">
                {logged.sets.map((s) => `${s.weight}×${s.reps}`).join(', ')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
