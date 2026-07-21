/**
 * Row×col emoji grid that stays readable on phones.
 * Small products: one emoji per cell.
 * Larger products: sample row + “× N rows” (still teaches arrays without a wall of sparkles).
 */

/** Full per-cell rendering only when both dims and total stay gentle. */
export const MAX_FULL_CELLS = 12
export const MAX_FULL_DIM = 5
/** How many icons in a sample row before we use a compact “× N” chip. */
export const MAX_SAMPLE_ICONS = 6

export function shouldUseFullGrid(rows: number, cols: number): boolean {
  return rows * cols <= MAX_FULL_CELLS && rows <= MAX_FULL_DIM && cols <= MAX_FULL_DIM
}

interface CountableGridProps {
  rows: number
  cols: number
  /** Empty / unsolved unit (seed, gem). */
  unit: string
  /** Solved / bloomed unit; defaults to unit. */
  unitSolved?: string
  solved?: boolean
  hintTier?: number
  /** Optional class on the outer wrapper. */
  className?: string
  /** Show running product after each row at hint tier ≥ 2. */
  showRunningTotal?: boolean
}

export function CountableGrid({
  rows,
  cols,
  unit,
  unitSolved,
  solved = false,
  hintTier = 0,
  className = '',
  showRunningTotal = true,
}: CountableGridProps) {
  const r = Math.max(0, rows)
  const c = Math.max(0, cols)
  const total = r * c
  const icon = solved ? (unitSolved ?? unit) : unit
  const full = shouldUseFullGrid(r, c)

  if (full) {
    return (
      <div
        className={`countable-grid full-grid ${className}`.trim()}
        aria-label={`${r} rows of ${c}, ${total} total`}
      >
        {Array.from({ length: r }, (_, row) => (
          <div key={row} className="countable-row">
            {Array.from({ length: c }, (_, col) => (
              <span
                key={col}
                className={`countable-cell ${solved ? 'solved' : ''}`}
                style={{ animationDelay: `${Math.min(row * c + col, 12) * 0.05}s` }}
              >
                {icon}
              </span>
            ))}
            {showRunningTotal && hintTier >= 2 && !solved && (
              <span className="gem-running">{(row + 1) * c}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Compact: one sample row + rows multiplier — keeps array idea without 77 sparkles.
  const showEach = c <= MAX_SAMPLE_ICONS
  return (
    <div
      className={`countable-grid compact-grid ${className}`.trim()}
      aria-label={`${r} rows of ${c}, ${total} total. Shown as one sample row times ${r}.`}
    >
      <p className="countable-dims">
        <strong>
          {r} × {c}
        </strong>
        <span> = {r} rows of {c}</span>
      </p>
      <div className="countable-sample">
        <div className="countable-row sample-row">
          {showEach ? (
            Array.from({ length: c }, (_, col) => (
              <span key={col} className={`countable-cell ${solved ? 'solved' : ''}`}>
                {icon}
              </span>
            ))
          ) : (
            <>
              {Array.from({ length: 3 }, (_, col) => (
                <span key={col} className={`countable-cell ${solved ? 'solved' : ''}`}>
                  {icon}
                </span>
              ))}
              <span className="countable-more" aria-hidden="true">
                …
              </span>
              <span className="countable-chip">× {c}</span>
            </>
          )}
        </div>
        <span className="countable-times" aria-hidden="true">
          × {r} rows
        </span>
      </div>
      {hintTier >= 2 && (
        <p className="countable-hint-total">
          {c} + {c} + … ({r} times) → look for <strong>{total}</strong>
        </p>
      )}
      {solved && (
        <p className="countable-answer-total" aria-live="polite">
          {total} altogether!
        </p>
      )}
    </div>
  )
}

/** Linear stack of emojis (fish, story props) with a hard visual cap. */
export function EmojiStack({
  count,
  emoji,
  maxVisible = 10,
  numbered = false,
  className = '',
}: {
  count: number
  emoji: string
  maxVisible?: number
  numbered?: boolean
  className?: string
}) {
  const n = Math.max(0, count)
  const visible = Math.min(n, maxVisible)
  const hidden = n - visible

  return (
    <div
      className={`emoji-stack ${className}`.trim()}
      aria-label={`${n} ${emoji}`}
    >
      {Array.from({ length: visible }, (_, i) => (
        <span key={i} className="emoji-stack-item">
          {emoji}
          {numbered && <span className="fish-number">{i + 1}</span>}
        </span>
      ))}
      {hidden > 0 && (
        <span className="emoji-stack-more" aria-hidden="true">
          +{hidden}
        </span>
      )}
    </div>
  )
}
