import type { GameDef, Round } from '../types'
import { ALPHABET, lookalikesFor } from './letterData'
import { sample, shuffle } from '../../lib/rng'

function generateRound(level: number): Round {
  const target = sample(ALPHABET, 1)[0]
  const count = Math.min(2 + level, 5)
  const lowercase = level >= 4

  let distractors: string[] = []
  if (level >= 3) distractors = sample(lookalikesFor(target.letter), count - 1)
  const remaining = ALPHABET.map((e) => e.letter).filter(
    (l) => l !== target.letter && !distractors.includes(l),
  )
  distractors = [...distractors, ...sample(remaining, count - 1 - distractors.length)]

  const letters = shuffle([target.letter, ...distractors])

  return {
    promptText: `Pop the letter ${target.letter}!`,
    promptSpeech: `Pop the balloon with the letter ${target.letter}!`,
    choices: letters.map((l) => ({ id: l, label: lowercase ? l.toLowerCase() : l })),
    answerId: target.letter,
    hints: {
      nudge: `${target.letter} is for ${target.word} ${target.emoji}!`,
      explain: `This one is ${target.letter}! ${target.letter} is for ${target.word}!`,
    },
    payload: { balloons: true },
  }
}

const letterPop: GameDef = {
  id: 'letterPop',
  world: 'letters',
  title: 'Letter Pop',
  emoji: '🎈',
  ages: '3–6',
  roundsPerSession: 5,
  generateRound,
}

export default letterPop
