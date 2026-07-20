import type { DisplayProps, GameDef, Round } from '../types'
import { shuffle } from '../../lib/rng'
import { drawFactors, productChoices } from './factors'

function generateRound(level: number): Round {
  const { a, b } = drawFactors(level)
  const product = a * b
  const skipCount = Array.from({ length: a }, (_, k) => (k + 1) * b).join(', ')

  return {
    promptText: `${a} × ${b} = ?`,
    promptSpeech: `Fuel the rocket! What is ${a} times ${b}?`,
    choices: shuffle(productChoices(a, b)).map((n) => ({ id: String(n), label: String(n) })),
    answerId: String(product),
    hints: {
      nudge: `Count by ${b}s: ${skipCount}!`,
      explain: `${a} times ${b} is ${product}! Blast off!`,
    },
    payload: { a, b },
  }
}

function Display({ round }: DisplayProps) {
  void round
  return (
    <div className="rocket-scene">
      <span className="rocket">🚀</span>
      <span className="rocket-flame">🔥</span>
    </div>
  )
}

const rocketRace: GameDef = {
  id: 'rocketRace',
  world: 'multiplication',
  title: 'Rocket Race',
  emoji: '🚀',
  ages: '7–10',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default rocketRace
