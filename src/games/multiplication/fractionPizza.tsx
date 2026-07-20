import type { DisplayProps, GameDef, Round } from '../types'
import { sample, shuffle } from '../../lib/rng'

const FRACTIONS = [
  { n: 1, d: 2, label: '1/2', words: 'one half' },
  { n: 1, d: 4, label: '1/4', words: 'one quarter' },
  { n: 2, d: 4, label: '2/4', words: 'two quarters' },
  { n: 3, d: 4, label: '3/4', words: 'three quarters' },
  { n: 1, d: 3, label: '1/3', words: 'one third' },
  { n: 2, d: 3, label: '2/3', words: 'two thirds' },
]

export function generateFractionRound(level: number): Round {
  const pool = level <= 2 ? FRACTIONS.slice(0, 4) : FRACTIONS
  const answer = sample(pool, 1)[0]
  // Exclude equivalent fractions (1/2 vs 2/4) — a correct kid must never be told they're wrong.
  const distractors = sample(
    FRACTIONS.filter((f) => f.n * answer.d !== answer.n * f.d),
    2,
  )
  return {
    promptText: 'How much pizza has toppings?',
    promptSpeech: `Fraction Pizza Party! What fraction of the pizza has toppings?`,
    choices: shuffle([answer, ...distractors]).map((f) => ({ id: f.label, label: f.label })), answerId: answer.label,
    hints: {
      nudge: `There are ${answer.d} equal slices. ${answer.n} ${answer.n === 1 ? 'slice has' : 'slices have'} toppings.`,
      explain: `${answer.n} out of ${answer.d} equal slices ${answer.n === 1 ? 'has' : 'have'} toppings. That is ${answer.words}.`,
    },
    payload: answer,
  }
}

function Display({ round, hintTier }: DisplayProps) {
  const { n, d } = round.payload as { n: number; d: number }
  return (
    <div className={`pizza-parts parts-${d}`} role="img" aria-label={`${n} of ${d} pizza slices ${n === 1 ? 'has' : 'have'} toppings`}>
      {Array.from({ length: d }, (_, i) => (
        <span key={i} className={`pizza-slice ${i < n ? 'topped' : ''}`} aria-hidden="true">
          {i < n && <i className="pepperoni" />}
        </span>
      ))}
      {hintTier >= 2 && <strong>{n} of {d}</strong>}
    </div>
  )
}

const fractionPizza: GameDef = {
  id: 'fractionPizza', world: 'multiplication', title: 'Fraction Pizza Party', emoji: '🍕', ages: '8–10',
  roundsPerSession: 5, generateRound: generateFractionRound, Display,
}

export default fractionPizza
