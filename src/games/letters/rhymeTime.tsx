import type { DisplayProps, GameDef, Round } from '../types'
import { sample, shuffle } from '../../lib/rng'

interface WordPic {
  word: string
  emoji: string
}

export interface RhymeFamily {
  id: string
  words: WordPic[]
}

export const RHYME_FAMILIES: RhymeFamily[] = [
  { id: 'at', words: [{ word: 'cat', emoji: '🐱' }, { word: 'hat', emoji: '🎩' }, { word: 'bat', emoji: '🦇' }, { word: 'rat', emoji: '🐀' }] },
  { id: 'og', words: [{ word: 'dog', emoji: '🐶' }, { word: 'frog', emoji: '🐸' }, { word: 'log', emoji: '🪵' }] },
  { id: 'ake', words: [{ word: 'cake', emoji: '🎂' }, { word: 'snake', emoji: '🐍' }] },
  { id: 'ar', words: [{ word: 'car', emoji: '🚗' }, { word: 'star', emoji: '⭐' }, { word: 'jar', emoji: '🫙' }, { word: 'guitar', emoji: '🎸' }] },
  { id: 'ee', words: [{ word: 'bee', emoji: '🐝' }, { word: 'tree', emoji: '🌳' }, { word: 'key', emoji: '🔑' }] },
  { id: 'oat', words: [{ word: 'boat', emoji: '⛵' }, { word: 'goat', emoji: '🐐' }, { word: 'coat', emoji: '🧥' }] },
  { id: 'ouse', words: [{ word: 'house', emoji: '🏠' }, { word: 'mouse', emoji: '🐭' }] },
  { id: 'ock', words: [{ word: 'sock', emoji: '🧦' }, { word: 'clock', emoji: '🕰️' }, { word: 'rock', emoji: '🪨' }, { word: 'lock', emoji: '🔒' }] },
  { id: 'ing', words: [{ word: 'ring', emoji: '💍' }, { word: 'king', emoji: '🤴' }] },
  { id: 'oon', words: [{ word: 'moon', emoji: '🌙' }, { word: 'spoon', emoji: '🥄' }, { word: 'balloon', emoji: '🎈' }] },
  { id: 'en', words: [{ word: 'hen', emoji: '🐔' }, { word: 'pen', emoji: '🖊️' }, { word: 'ten', emoji: '🔟' }] },
  { id: 'ish', words: [{ word: 'fish', emoji: '🐟' }, { word: 'dish', emoji: '🍽️' }] },
  { id: 'air', words: [{ word: 'bear', emoji: '🐻' }, { word: 'pear', emoji: '🍐' }, { word: 'chair', emoji: '🪑' }] },
  { id: 'own', words: [{ word: 'crown', emoji: '👑' }, { word: 'clown', emoji: '🤡' }] },
  { id: 'un', words: [{ word: 'sun', emoji: '☀️' }, { word: 'run', emoji: '🏃' }] },
]

function generateRound(level: number): Round {
  const lvl = Math.min(Math.max(level, 1), 5)
  const choiceCount = Math.min(1 + lvl, 4)

  const family = sample(RHYME_FAMILIES, 1)[0]
  const [target, answer] = sample(family.words, 2)

  const otherWords = RHYME_FAMILIES.filter((f) => f.id !== family.id).flatMap(
    (f) => f.words,
  )
  const distractors = sample(otherWords, choiceCount - 1)

  const choices = shuffle([answer, ...distractors])

  return {
    promptText: `What rhymes with ${target.word}?`,
    promptSpeech: `${target.word}! What rhymes with ${target.word}?`,
    choices: choices.map((w) => ({ id: w.word, label: `${w.emoji} ${w.word}` })),
    answerId: answer.word,
    hints: {
      nudge: `Rhymes sound the same at the end! ${target.word}... say each picture out loud!`,
      explain: `${target.word} and ${answer.word} rhyme! ${target.word}, ${answer.word} — hear it?`,
    },
    payload: { target },
  }
}

function Display({ round }: DisplayProps) {
  const target = (round.payload as { target: WordPic }).target
  return (
    <div className="rhyme-target">
      <span className="rhyme-emoji">{target.emoji}</span>
      <span className="rhyme-word">{target.word}</span>
    </div>
  )
}

const rhymeTime: GameDef = {
  id: 'rhymeTime',
  world: 'letters',
  title: 'Rhyme Time',
  emoji: '🎵',
  ages: '5–6',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default rhymeTime
