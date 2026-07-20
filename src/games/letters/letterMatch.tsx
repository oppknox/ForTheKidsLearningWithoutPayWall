import type { DisplayProps, GameDef, Round } from '../types'
import { ALPHABET, entryFor, lookalikesFor } from './letterData'
import { sample, shuffle } from '../../lib/rng'

function generateRound(level: number): Round {
  const target = sample(ALPHABET, 1)[0]
  const count = Math.min(3 + level, 6)

  let distractors: string[] = []
  if (level >= 3) distractors = sample(lookalikesFor(target.letter), count - 1)
  const remaining = ALPHABET.map((e) => e.letter).filter(
    (l) => l !== target.letter && !distractors.includes(l),
  )
  distractors = [...distractors, ...sample(remaining, count - 1 - distractors.length)]

  const letters = shuffle([target.letter, ...distractors])

  return {
    promptText: `Find the little ${target.letter.toLowerCase()}!`,
    promptSpeech: `Big ${target.letter} needs its little match! Find the small ${target.letter}!`,
    choices: letters.map((l) => ({ id: l.toLowerCase(), label: l.toLowerCase() })),
    answerId: target.letter.toLowerCase(),
    hints: {
      nudge: `Big ${target.letter} and little ${target.letter.toLowerCase()} are the same letter — ${target.letter} for ${target.word} ${target.emoji}!`,
      explain: `This is little ${target.letter.toLowerCase()}! Big ${target.letter} and little ${target.letter.toLowerCase()} go together!`,
    },
    payload: { target: target.letter },
  }
}

function Display({ round }: DisplayProps) {
  const target = (round.payload as { target: string }).target
  const entry = entryFor(target)
  return (
    <div className="letter-display">
      <span className="letter-big">{target}</span>
      <span className="letter-word">
        {entry.emoji} {entry.word}
      </span>
    </div>
  )
}

const letterMatch: GameDef = {
  id: 'letterMatch',
  world: 'letters',
  title: 'Letter Match',
  emoji: '🧩',
  ages: '4–6',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default letterMatch
