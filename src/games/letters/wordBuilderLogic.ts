import { sample, shuffle } from '../../lib/rng'

export interface WordEntry {
  word: string
  emoji: string
}

export const WORDS: WordEntry[] = [
  // 3 letters
  { word: 'cat', emoji: '🐱' },
  { word: 'dog', emoji: '🐶' },
  { word: 'sun', emoji: '☀️' },
  { word: 'hat', emoji: '🎩' },
  { word: 'bus', emoji: '🚌' },
  { word: 'pig', emoji: '🐷' },
  { word: 'bed', emoji: '🛏️' },
  { word: 'fox', emoji: '🦊' },
  { word: 'hen', emoji: '🐔' },
  { word: 'pen', emoji: '🖊️' },
  { word: 'van', emoji: '🚐' },
  { word: 'web', emoji: '🕸️' },
  { word: 'egg', emoji: '🥚' },
  { word: 'ant', emoji: '🐜' },
  { word: 'key', emoji: '🔑' },
  { word: 'map', emoji: '🗺️' },
  { word: 'owl', emoji: '🦉' },
  { word: 'cow', emoji: '🐮' },
  { word: 'bee', emoji: '🐝' },
  { word: 'car', emoji: '🚗' },
  // 4 letters
  { word: 'star', emoji: '⭐' },
  { word: 'frog', emoji: '🐸' },
  { word: 'cake', emoji: '🎂' },
  { word: 'fish', emoji: '🐟' },
  { word: 'moon', emoji: '🌙' },
  { word: 'boat', emoji: '⛵' },
  { word: 'tree', emoji: '🌳' },
  { word: 'bird', emoji: '🐦' },
  { word: 'duck', emoji: '🦆' },
  { word: 'lion', emoji: '🦁' },
  { word: 'bear', emoji: '🐻' },
  { word: 'corn', emoji: '🌽' },
  { word: 'ship', emoji: '🚢' },
  { word: 'sock', emoji: '🧦' },
  { word: 'ring', emoji: '💍' },
  { word: 'drum', emoji: '🥁' },
  { word: 'kite', emoji: '🪁' },
  // 5 letters
  { word: 'snake', emoji: '🐍' },
  { word: 'train', emoji: '🚂' },
  { word: 'bread', emoji: '🍞' },
  { word: 'cloud', emoji: '☁️' },
  { word: 'house', emoji: '🏠' },
  { word: 'mouse', emoji: '🐭' },
  { word: 'apple', emoji: '🍎' },
  { word: 'tiger', emoji: '🐯' },
  { word: 'pizza', emoji: '🍕' },
  { word: 'robot', emoji: '🤖' },
  { word: 'whale', emoji: '🐳' },
  { word: 'clock', emoji: '🕰️' },
]

const LENGTH_PER_LEVEL: Record<number, number> = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 5 }
export const DISTRACTORS_PER_LEVEL: Record<number, number> = { 1: 2, 2: 4, 3: 3, 4: 5, 5: 4 }

export interface WordRound {
  word: WordEntry
  /** Shuffled letter bank: every letter occurrence of the word + distractors. */
  bank: string[]
}

export function generateWordRound(level: number, exclude?: Set<string>): WordRound {
  const lvl = Math.min(Math.max(level, 1), 5)
  const length = LENGTH_PER_LEVEL[lvl]
  let pool = WORDS.filter((w) => w.word.length === length && !exclude?.has(w.word))
  if (pool.length === 0) pool = WORDS.filter((w) => w.word.length === length)
  const word = sample(pool, 1)[0]

  const wordLetters = new Set(word.word)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const distractors = sample(
    alphabet.filter((l) => !wordLetters.has(l)),
    DISTRACTORS_PER_LEVEL[lvl],
  )

  return { word, bank: shuffle([...word.word, ...distractors]) }
}
