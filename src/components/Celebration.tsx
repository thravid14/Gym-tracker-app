import { useEffect, useRef, useState, type CSSProperties } from 'react'

const COLORS = ['var(--accent)', '#22c55e', '#3b82f6', '#eab308']
const PARTICLE_COUNT = 28
const LIFETIME_MS = 1400

interface Particle {
  id: number
  left: number
  color: string
  delay: number
  duration: number
  drift: number
  rotate: number
}

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 150,
    duration: 900 + Math.random() * 500,
    drift: (Math.random() - 0.5) * 80,
    rotate: Math.random() * 540 - 270,
  }))
}

/**
 * Fires a brief confetti burst whenever `fire` increments (0 does nothing —
 * that's the initial/idle value). Purely decorative, self-cleans up.
 */
export function Celebration({ fire }: { fire: number }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const prevFire = useRef(fire)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (fire === prevFire.current) return
    prevFire.current = fire
    setParticles(makeParticles())
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setParticles([]), LIFETIME_MS)
    return () => clearTimeout(timeoutRef.current)
  }, [fire])

  if (particles.length === 0) return null

  return (
    <div className="celebration" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="celebration__particle"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
              '--drift': `${p.drift}px`,
              '--rotate': `${p.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
