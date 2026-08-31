import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 600

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

/** Animates a displayed number toward `value` whenever it changes, instead of jumping instantly. */
export function useCountUp(value: number): number {
  const [displayed, setDisplayed] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    const start = performance.now()
    cancelAnimationFrame(rafRef.current!)

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / DURATION_MS)
      const eased = easeOutQuad(t)
      setDisplayed(from + (to - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return displayed
}
