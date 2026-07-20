export interface LetterEntry {
  letter: string
  word: string
  emoji: string
}

export const ALPHABET: LetterEntry[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Banana', emoji: '🍌' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Grapes', emoji: '🍇' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Octopus', emoji: '🐙' },
  { letter: 'P', word: 'Penguin', emoji: '🐧' },
  { letter: 'Q', word: 'Queen', emoji: '👸' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Turtle', emoji: '🐢' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐳' },
  { letter: 'X', word: 'X-ray', emoji: '🦴' },
  { letter: 'Y', word: 'Yo-yo', emoji: '🪀' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
]

export function entryFor(letter: string): LetterEntry {
  return ALPHABET.find((e) => e.letter === letter.toUpperCase()) ?? ALPHABET[0]
}

/** Letters kids commonly confuse — used as tricky distractors at higher levels. */
export const LOOKALIKES: string[][] = [
  ['B', 'D', 'P', 'Q', 'R'],
  ['M', 'W', 'N'],
  ['O', 'Q', 'C', 'G'],
  ['E', 'F', 'L', 'T'],
  ['I', 'J', 'L', 'T'],
  ['U', 'V', 'Y', 'W'],
  ['K', 'X', 'Y'],
  ['S', 'Z'],
  ['A', 'H'],
]

export function lookalikesFor(letter: string): string[] {
  const upper = letter.toUpperCase()
  const group = LOOKALIKES.find((g) => g.includes(upper))
  return group ? group.filter((l) => l !== upper) : []
}
