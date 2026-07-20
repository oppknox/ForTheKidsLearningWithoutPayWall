import type { DisplayProps, GameDef, Round } from '../types'
import { randInt, sample, shuffle } from '../../lib/rng'
import { productChoices } from './factors'

/** Which times tables each level practices — one new table family at a time. */
export const TABLES_PER_LEVEL: Record<number, number[]> = {
  1: [2],
  2: [3],
  3: [4, 5],
  4: [6, 7],
  5: [8, 9],
}

function generateRound(level: number): Round {
  const lvl = Math.min(Math.max(level, 1), 5)
  const table = sample(TABLES_PER_LEVEL[lvl], 1)[0]
  const rows = randInt(2, 9)
  const product = rows * table
  const skipCount = Array.from({ length: rows }, (_, k) => (k + 1) * table).join(', ')

  return {
    promptText: `${rows} × ${table} = ?`,
    promptSpeech: `Let's plant the garden! ${rows} rows with ${table} seeds in each row. How many flowers will grow?`,
    choices: shuffle(productChoices(rows, table)).map((n) => ({
      id: String(n),
      label: String(n),
    })),
    answerId: String(product),
    hints: {
      nudge: `Count each row by ${table}s: ${skipCount}!`,
      explain: `${rows} rows of ${table} seeds grows ${product} flowers! ${rows} times ${table} is ${product}!`,
    },
    payload: { a: rows, b: table },
  }
}

function Display({ round, hintTier, solved }: DisplayProps) {
  const { a, b } = round.payload as { a: number; b: number }
  return (
    <div className="garden">
      {Array.from({ length: a }, (_, row) => (
        <div key={row} className="garden-row">
          {Array.from({ length: b }, (_, col) => (
            <span
              key={col}
              className={`seed ${solved ? 'bloomed' : ''}`}
              style={{
                animationDelay: solved
                  ? `${(row * b + col) * 0.05}s`
                  : `${(row * b + col) * 0.06}s`,
              }}
            >
              {solved ? '🌷' : '🌱'}
            </span>
          ))}
          {hintTier >= 2 && !solved && (
            <span className="gem-running">{(row + 1) * b}</span>
          )}
        </div>
      ))}
    </div>
  )
}

const timesTableGarden: GameDef = {
  id: 'timesGarden',
  world: 'multiplication',
  title: 'Times Table Garden',
  emoji: '🌷',
  ages: '7–8',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default timesTableGarden
