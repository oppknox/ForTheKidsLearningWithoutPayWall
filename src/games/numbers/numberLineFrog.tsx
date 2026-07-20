import type { DisplayProps, GameDef, Round } from '../types'
import { randInt, shuffle } from '../../lib/rng'

const LINE_MAX = 20

function generateRound(level: number): Round {
  const lvl = Math.min(Math.max(level, 1), 5)
  let start: number
  let delta: number
  let op: '+' | '-'

  if (lvl <= 2) {
    op = '+'
    const cap = lvl === 1 ? 5 : 10
    start = randInt(0, cap - 1)
    delta = randInt(1, cap - start)
  } else if (lvl === 3) {
    op = '-'
    start = randInt(2, 10)
    delta = randInt(1, start)
  } else {
    const cap = lvl === 4 ? 15 : 20
    op = Math.random() < 0.5 ? '+' : '-'
    if (op === '+') {
      start = randInt(0, cap - 1)
      delta = randInt(1, cap - start)
    } else {
      start = randInt(2, cap)
      delta = randInt(1, start)
    }
  }

  const answer = op === '+' ? start + delta : start - delta

  const options = new Set<number>([answer])
  while (options.size < 3) {
    const candidate = answer + randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1)
    if (candidate >= 0 && candidate <= LINE_MAX) options.add(candidate)
  }

  const hopWord = op === '+' ? 'forward' : 'back'

  return {
    promptText: `${start} ${op === '+' ? '+' : '−'} ${delta} = ?`,
    promptSpeech: `The frog starts on ${start} and hops ${delta} ${hopWord}! Where does it land?`,
    choices: shuffle([...options]).map((n) => ({ id: String(n), label: String(n) })),
    answerId: String(answer),
    hints: {
      nudge: `Start on ${start}, then hop ${hopWord} ${delta} ${delta === 1 ? 'time' : 'times'} — count each hop!`,
      explain: `${start} ${op === '+' ? 'plus' : 'take away'} ${delta} lands on ${answer}!`,
    },
    payload: { start, delta, op },
  }
}

function Display({ round, hintTier, solved }: DisplayProps) {
  const { start, delta, op } = round.payload as { start: number; delta: number; op: '+' | '-' }
  const answer = op === '+' ? start + delta : start - delta
  const max = Math.min(Math.max(start, answer) + 2, LINE_MAX)
  const showHops = (hintTier ?? 0) >= 2 || solved
  const frogAt = solved ? answer : start

  const hopped = (n: number) =>
    op === '+' ? n > start && n <= answer : n < start && n >= answer

  return (
    <div className="number-line">
      {Array.from({ length: max + 1 }, (_, n) => (
        <div key={n} className="line-cell">
          <span className="line-frog">{n === frogAt ? '🐸' : ''}</span>
          <span className="line-paw">{showHops && hopped(n) && n !== frogAt ? '🐾' : ''}</span>
          <span className={`line-number ${n === frogAt ? 'line-here' : ''}`}>{n}</span>
        </div>
      ))}
    </div>
  )
}

const numberLineFrog: GameDef = {
  id: 'numberFrog',
  world: 'numbers',
  title: 'Number Line Frog',
  emoji: '🐸',
  ages: '5–7',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default numberLineFrog
