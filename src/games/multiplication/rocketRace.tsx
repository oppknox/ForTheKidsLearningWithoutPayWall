import type { DisplayProps, GameDef, Round, RoundContext } from '../types'
import { shuffle } from '../../lib/rng'
import { drawFactorsWithMastery, factItemId, productChoices } from './factors'

function generateRound(level: number, ctx?: RoundContext): Round {
  const { a, b } = drawFactorsWithMastery(level, ctx)
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
    itemId: factItemId(a, b),
  }
}

function Display({ round, solved }: DisplayProps) {
  void round
  return (
    <div className={`rocket-scene ${solved ? 'blastoff' : ''}`}>
      <span className="rocket">🚀</span>
      <span className="rocket-flame">🔥</span>
      {solved && (
        <>
          <span className="rocket-trail" style={{ animationDelay: '0.05s' }}>💨</span>
          <span className="rocket-trail" style={{ animationDelay: '0.2s' }}>✨</span>
        </>
      )}
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
