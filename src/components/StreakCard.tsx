import { useMemo } from 'react'
import { useAppState } from '../state/AppState'
import { computeStreaks } from '../lib/streaks'
import { useCountUp } from '../hooks/useCountUp'
import { localDateKey } from '../lib/dates'
import { Card } from './ui'

/** Current + best workout streak. Rest days (logged as skipped) don't break it. */
export function StreakCard({ className = '' }: { className?: string }) {
  const { sessions, skippedDays } = useAppState()
  const today = localDateKey()
  const streak = useMemo(
    () => computeStreaks(sessions, skippedDays, today),
    [sessions, skippedDays, today],
  )
  const animated = useCountUp(streak.current)

  let hint: string
  if (streak.current === 0) hint = 'Train today to start a streak'
  else if (streak.atRisk) hint = 'Train today to keep it going'
  else if (streak.trainedToday) hint = "Today's done — nice"
  else hint = 'Resting today — streak is safe'

  return (
    <Card className={`flex items-center gap-3 ${className}`}>
      <span className="text-3xl leading-none" aria-hidden="true">
        {streak.current > 0 ? '🔥' : '💤'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {Math.round(animated)} day{streak.current === 1 ? '' : 's'} streak
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold">{streak.longest}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          best
        </p>
      </div>
    </Card>
  )
}
