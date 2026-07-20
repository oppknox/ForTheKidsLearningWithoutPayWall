import type { DisplayProps, GameDef, Round } from '../types'
import { sample, shuffle } from '../../lib/rng'

const SOUND_SETS = [
  { letter: 'B', sound: 'buh', items: [['ball', '⚽'], ['sun', '☀️'], ['cat', '🐱']] },
  { letter: 'C', sound: 'kuh', items: [['cat', '🐱'], ['fish', '🐟'], ['moon', '🌙']] },
  { letter: 'D', sound: 'duh', items: [['dog', '🐶'], ['apple', '🍎'], ['sun', '☀️']] },
  { letter: 'F', sound: 'fff', items: [['fish', '🐟'], ['ball', '⚽'], ['dog', '🐶']] },
  { letter: 'M', sound: 'mmm', items: [['moon', '🌙'], ['cat', '🐱'], ['fish', '🐟']] },
  { letter: 'S', sound: 'sss', items: [['sun', '☀️'], ['moon', '🌙'], ['apple', '🍎']] },
]

export function generateSoundRound(): Round {
  const set = sample(SOUND_SETS, 1)[0]
  const answer = set.items[0]
  return {
    promptText: `Which begins with ${set.letter}?`,
    promptSpeech: `${set.letter} says ${set.sound}. Which picture begins with ${set.sound}?`,
    choices: shuffle(set.items).map(([word, emoji]) => ({ id: word, label: `${emoji} ${word}` })),
    answerId: answer[0],
    hints: {
      nudge: `Listen again. ${set.letter} says ${set.sound}.`,
      explain: `${answer[0]} begins with ${set.letter}. ${set.sound}, ${answer[0]}!`,
    },
    payload: { letter: set.letter, sound: set.sound },
  }
}

function Display({ round }: DisplayProps) {
  const { letter, sound } = round.payload as { letter: string; sound: string }
  return <div className="sound-flower" aria-label={`${letter} says ${sound}`}><span>🌼</span><strong>{letter}</strong></div>
}

const soundGarden: GameDef = {
  id: 'soundGarden', world: 'letters', title: "Pip's Sound Garden", emoji: '🌼', ages: '3–6',
  roundsPerSession: 5, generateRound: generateSoundRound, Display,
}

export default soundGarden
