import type { DisplayProps, GameDef, Round, RoundContext } from '../types'
import { shuffle } from '../../lib/rng'
import { drawFactorsWithMastery, factItemId, productChoices } from './factors'

function generateRound(level: number, ctx?: RoundContext): Round {
  const { a, b } = drawFactorsWithMastery(level, ctx)
  const product = a * b

  return {
    promptText: `${a} × ${b} = ?`,
    promptSpeech: `What is ${a} times ${b}? Look at the gems — ${a} rows with ${b} gems in each row!`,
    choices: shuffle(productChoices(a, b)).map((n) => ({ id: String(n), label: String(n) })),
    answerId: String(product),
    hints: {
      nudge: `${a} times ${b} means ${a} rows of ${b} gems. Count a row, then add it ${a} times!`,
      explain: `${a} rows of ${b} gems makes ${product}! ${a} times ${b} is ${product}!`,
    },
    payload: { a, b },
    itemId: factItemId(a, b),
  }
}

function Display({ round, hintTier }: DisplayProps) {
  const { a, b } = round.payload as { a: number; b: number }
  return (
    <div className="gem-array">
      {Array.from({ length: a }, (_, row) => (
        <div key={row} className="gem-row">
          {Array.from({ length: b }, (_, col) => (
            <span
              key={col}
              className="gem"
              style={{ animationDelay: `${(row * b + col) * 0.06}s` }}
            >
              💎
            </span>
          ))}
          {hintTier >= 2 && <span className="gem-running">{(row + 1) * b}</span>}
        </div>
      ))}
    </div>
  )
}

const arrayBuilder: GameDef = {
  id: 'arrayBuilder',
  world: 'multiplication',
  title: 'Array Builder',
  emoji: '💎',
  ages: '7–10',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default arrayBuilder
