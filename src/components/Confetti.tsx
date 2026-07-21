import { useMemo } from 'react'

const COLORS = ['#ff7b54', '#ffc93c', '#2aa7de', '#8e6fd8', '#5cc46a', '#ff5f9e']

/** Fires a gentle burst of pieces when `burst` increments. burst=0 renders nothing. */
export function Confetti({ burst }: { burst: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
      })),
    [burst],
  )

  if (burst === 0) return null

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={`${burst}-${i}`}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            background: p.color,
            borderRadius: p.round ? '50%' : '3px',
          }}
        />
      ))}
    </div>
  )
}
