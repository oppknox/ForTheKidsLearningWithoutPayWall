import type { DisplayProps, GameDef, Round, RoundContext } from '../types'
import { sample, shuffle } from '../../lib/rng'
import { itemKey, pickPreferredId } from '../../lib/itemMastery'

type SoundSet = {
  letter: string
  sound: string
  /** First item is always the correct answer. */
  items: [string, string][]
}

/**
 * Full A–Z phonics garden. Continuous / early sounds first in spirit;
 * every letter has a clear initial-sound picture + two distractors.
 */
export const SOUND_SETS: SoundSet[] = [
  { letter: 'A', sound: 'aaa', items: [['apple', '🍎'], ['ball', '⚽'], ['dog', '🐶']] },
  { letter: 'B', sound: 'buh', items: [['ball', '⚽'], ['sun', '☀️'], ['cat', '🐱']] },
  { letter: 'C', sound: 'kuh', items: [['cat', '🐱'], ['fish', '🐟'], ['moon', '🌙']] },
  { letter: 'D', sound: 'duh', items: [['dog', '🐶'], ['apple', '🍎'], ['sun', '☀️']] },
  { letter: 'E', sound: 'eh', items: [['elephant', '🐘'], ['fish', '🐟'], ['ball', '⚽']] },
  { letter: 'F', sound: 'fff', items: [['fish', '🐟'], ['dog', '🐶'], ['moon', '🌙']] },
  { letter: 'G', sound: 'guh', items: [['grapes', '🍇'], ['apple', '🍎'], ['sun', '☀️']] },
  { letter: 'H', sound: 'huh', items: [['hat', '🎩'], ['fish', '🐟'], ['cat', '🐱']] },
  { letter: 'I', sound: 'ih', items: [['igloo', '🏠'], ['ball', '⚽'], ['dog', '🐶']] },
  { letter: 'J', sound: 'juh', items: [['juice', '🧃'], ['moon', '🌙'], ['apple', '🍎']] },
  { letter: 'K', sound: 'kuh', items: [['kite', '🪁'], ['sun', '☀️'], ['fish', '🐟']] },
  { letter: 'L', sound: 'lll', items: [['lion', '🦁'], ['apple', '🍎'], ['ball', '⚽']] },
  { letter: 'M', sound: 'mmm', items: [['moon', '🌙'], ['cat', '🐱'], ['fish', '🐟']] },
  { letter: 'N', sound: 'nnn', items: [['nest', '🪺'], ['dog', '🐶'], ['sun', '☀️']] },
  { letter: 'O', sound: 'ah', items: [['octopus', '🐙'], ['ball', '⚽'], ['cat', '🐱']] },
  { letter: 'P', sound: 'puh', items: [['penguin', '🐧'], ['apple', '🍎'], ['moon', '🌙']] },
  { letter: 'Q', sound: 'kwuh', items: [['queen', '👸'], ['fish', '🐟'], ['dog', '🐶']] },
  { letter: 'R', sound: 'rrr', items: [['rainbow', '🌈'], ['sun', '☀️'], ['ball', '⚽']] },
  { letter: 'S', sound: 'sss', items: [['sun', '☀️'], ['moon', '🌙'], ['apple', '🍎']] },
  { letter: 'T', sound: 'tuh', items: [['turtle', '🐢'], ['cat', '🐱'], ['fish', '🐟']] },
  { letter: 'U', sound: 'uh', items: [['umbrella', '☂️'], ['dog', '🐶'], ['ball', '⚽']] },
  { letter: 'V', sound: 'vvv', items: [['violin', '🎻'], ['apple', '🍎'], ['sun', '☀️']] },
  { letter: 'W', sound: 'wuh', items: [['whale', '🐳'], ['cat', '🐱'], ['moon', '🌙']] },
  { letter: 'X', sound: 'ks', items: [['x-ray', '🦴'], ['fish', '🐟'], ['dog', '🐶']] },
  { letter: 'Y', sound: 'yuh', items: [['yo-yo', '🪀'], ['apple', '🍎'], ['ball', '⚽']] },
  { letter: 'Z', sound: 'zzz', items: [['zebra', '🦓'], ['sun', '☀️'], ['cat', '🐱']] },
]

/** Early continuous consonants — preferred at lower levels. */
const EARLY_LETTERS = new Set(['M', 'S', 'F', 'A', 'B', 'T', 'P', 'N', 'D', 'C', 'H', 'L'])

export function generateSoundRound(level = 1, ctx?: RoundContext): Round {
  const pool =
    level <= 2
      ? SOUND_SETS.filter((s) => EARLY_LETTERS.has(s.letter))
      : level <= 4
        ? SOUND_SETS.filter((s) => s.letter !== 'Q' && s.letter !== 'X')
        : SOUND_SETS

  const letters = pool.map((s) => s.letter)
  const recent = (ctx?.recentItemIds ?? [])
    .filter((k) => k.startsWith('sound:'))
    .map((k) => k.slice('sound:'.length))
  const preferred =
    ctx?.preferItemId?.startsWith('sound:')
      ? ctx.preferItemId.slice('sound:'.length)
      : pickPreferredId(ctx?.allMastery, 'sound', letters, recent)

  const set =
    pool.find((s) => s.letter === preferred) ??
    sample(pool.length > 0 ? pool : SOUND_SETS, 1)[0]

  const answer = set.items[0]
  // At higher levels, shuffle distractor hardness is already in the set; always shuffle display.
  return {
    promptText: `Which begins with the /${set.letter.toLowerCase()}/ sound?`,
    promptSpeech: `${set.letter} says ${set.sound}. Which picture begins with ${set.sound}?`,
    choices: shuffle(set.items).map(([word, emoji]) => ({ id: word, label: `${emoji}\n${word}` })),
    answerId: answer[0],
    hints: {
      nudge: `Listen again. ${set.letter} says ${set.sound}.`,
      explain: `${answer[0]} begins with ${set.letter}. ${set.sound}, ${answer[0]}!`,
    },
    payload: { letter: set.letter, sound: set.sound },
    itemId: itemKey('sound', set.letter),
  }
}

function Display({ round, hintTier, solved }: DisplayProps) {
  const { letter, sound } = round.payload as { letter: string; sound: string }
  return (
    <div className={`sound-flower ${solved ? 'bloomed' : ''}`} aria-label={`${letter} says ${sound}`}>
      {hintTier > 0 && !solved && <span className="sound-bee" aria-hidden="true">🐝</span>}
      <span className="flower-picture">🌼</span>
      <strong>{letter}</strong>
    </div>
  )
}

const soundGarden: GameDef = {
  id: 'soundGarden',
  world: 'letters',
  title: "Pip's Sound Garden",
  emoji: '🌼',
  ages: '3–6',
  roundsPerSession: 5,
  generateRound: generateSoundRound,
  Display,
}

export default soundGarden
