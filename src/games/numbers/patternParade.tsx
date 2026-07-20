import type { DisplayProps, GameDef, Round } from '../types'
import { sample, shuffle } from '../../lib/rng'

const PAIRS = [['🔵', '🟡'], ['🍎', '🍐'], ['🐸', '🦊'], ['⭐', '☁️'], ['🌷', '🌻']]

export function generatePatternRound(level: number): Round {
  const [a, b] = sample(PAIRS, 1)[0]
  const advanced = level >= 4
  // ABAB... continues with b; AABAAB... continues with a.
  const sequence = advanced ? [a, a, b, a, a, b] : [a, b, a, b, a]
  const answer = advanced ? a : b
  const other = advanced ? b : a
  const distractor = sample(['🟣', '🟢', '🐠', '❤️', '🌙'].filter((x) => x !== a && x !== b), 1)[0]
  return {
    promptText: 'What comes next?',
    promptSpeech: `Look at the pattern. ${sequence.join(', ')}. What comes next?`,
    choices: shuffle([answer, other, distractor]).map((x) => ({ id: x, label: x })),
    answerId: answer,
    hints: { nudge: 'Say the pattern slowly and listen for what repeats.', explain: `${answer} comes next because the pattern repeats!` },
    payload: { sequence },
  }
}

function Display({ round }: DisplayProps) {
  const { sequence } = round.payload as { sequence: string[] }
  return <div className="pattern-strip" aria-label={`Pattern: ${sequence.join(', ')}`}>{sequence.map((x, i) => <span key={i}>{x}</span>)}<span className="pattern-missing">?</span></div>
}

const patternParade: GameDef = {
  id: 'patternParade', world: 'numbers', title: 'Pattern Parade', emoji: '🎏', ages: '4–7',
  roundsPerSession: 5, generateRound: generatePatternRound, Display,
}

export default patternParade
