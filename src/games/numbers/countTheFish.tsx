import type { DisplayProps, GameDef, Round, RoundContext } from '../types'
import { randInt, shuffle } from '../../lib/rng'
import { itemKey } from '../../lib/itemMastery'
import { EmojiStack } from '../../components/CountableGrid'

/** Keep counts countable on a phone; higher levels still stretch a bit. */
const RANGES: Record<number, [number, number]> = {
  1: [1, 5],
  2: [1, 8],
  3: [1, 10],
  4: [4, 12],
  5: [6, 12],
}

function generateRound(level: number, _ctx?: RoundContext): Round {
  const [lo, hi] = RANGES[Math.min(Math.max(level, 1), 5)]
  const count = randInt(lo, hi)

  const options = new Set<number>([count])
  while (options.size < 3) {
    const offset = randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1)
    const candidate = count + offset
    if (candidate >= 1) options.add(candidate)
  }

  return {
    promptText: 'How many fish?',
    promptSpeech: 'Count the fish! How many fish are swimming?',
    choices: shuffle([...options]).map((n) => ({ id: String(n), label: String(n) })),
    answerId: String(count),
    hints: {
      nudge: `Try tapping each fish as you count — one, two, three...`,
      explain: `There are ${count} fish! Let's count them together: ${countingWords(count)}!`,
    },
    payload: { count },
    itemId: itemKey('count', String(count)),
  }
}

function countingWords(n: number): string {
  return Array.from({ length: n }, (_, i) => String(i + 1)).join(', ')
}

function Display({ round, hintTier }: DisplayProps) {
  const count = (round.payload as { count: number }).count
  return (
    <div className="fish-tank">
      <EmojiStack
        count={count}
        emoji="🐠"
        maxVisible={10}
        numbered={hintTier >= 2}
        className="fish-stack"
      />
    </div>
  )
}

const countTheFish: GameDef = {
  id: 'countFish',
  world: 'numbers',
  title: 'Count the Fish',
  emoji: '🐠',
  ages: '3–6',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default countTheFish
