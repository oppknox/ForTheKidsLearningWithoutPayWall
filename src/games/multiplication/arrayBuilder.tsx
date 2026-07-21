import type { DisplayProps, GameDef, Round, RoundContext } from '../types'
import { shuffle } from '../../lib/rng'
import { drawFactorsWithMastery, factItemId, productChoices } from './factors'
import { CountableGrid } from '../../components/CountableGrid'

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

function Display({ round, hintTier, solved }: DisplayProps) {
  const { a, b } = round.payload as { a: number; b: number }
  return (
    <CountableGrid
      rows={a}
      cols={b}
      unit="💎"
      solved={solved}
      hintTier={hintTier}
      className="gem-array"
    />
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
