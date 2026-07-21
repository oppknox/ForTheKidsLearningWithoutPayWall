import type { DisplayProps, GameDef, Round, RoundContext } from '../types'
import { randInt, shuffle } from '../../lib/rng'
import { itemKey } from '../../lib/itemMastery'

function generateRound(level: number, _ctx?: RoundContext): Round {
  const lvl = Math.min(Math.max(level, 1), 5)
  let a: number
  let b: number
  let op: '+' | '-'

  if (lvl <= 3) {
    op = '+'
    const cap = lvl === 1 ? 5 : lvl === 2 ? 10 : 20
    a = randInt(1, cap - 1)
    b = randInt(1, cap - a)
  } else {
    op = '-'
    const cap = lvl === 4 ? 10 : 20
    a = randInt(2, cap)
    b = randInt(1, a)
  }

  const answer = op === '+' ? a + b : a - b

  const options = new Set<number>([answer])
  while (options.size < 3) {
    const candidate = answer + randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1)
    if (candidate >= 0) options.add(candidate)
  }

  const speech =
    op === '+'
      ? `What is ${a} plus ${b}? Pop the bubbles and count them all!`
      : `What is ${a} take away ${b}? Watch the bubbles pop away!`

  const sumId = op === '+' ? `${a}+${b}` : `${a}-${b}`

  return {
    promptText: `${a} ${op === '+' ? '+' : '−'} ${b} = ?`,
    promptSpeech: speech,
    choices: shuffle([...options]).map((n) => ({ id: String(n), label: String(n) })),
    answerId: String(answer),
    hints: {
      nudge:
        op === '+'
          ? `Count ALL the bubbles — the ${a} on this side and the ${b} on that side!`
          : `Start with ${a} bubbles, then ${b} float away. How many are left?`,
      explain:
        op === '+'
          ? `${a} plus ${b} makes ${answer}! Count them all together!`
          : `${a} take away ${b} leaves ${answer}!`,
    },
    payload: { a, b, op },
    itemId: itemKey('sum', sumId),
  }
}

function BubbleGroup({
  count,
  fading,
}: {
  count: number
  fading?: boolean
}) {
  const visible = Math.min(count, 10)
  const hidden = count - visible
  return (
    <div className={`bubble-group ${fading ? 'bubble-group-away' : ''}`}>
      {Array.from({ length: visible }, (_, i) => (
        <span key={i} className={`bubble ${fading ? 'bubble-away' : ''}`}>
          🫧
        </span>
      ))}
      {hidden > 0 && <span className="emoji-stack-more">+{hidden}</span>}
    </div>
  )
}

function Display({ round, hintTier }: DisplayProps) {
  const { a, b, op } = round.payload as { a: number; b: number; op: '+' | '-' }
  return (
    <div className="bubble-scene">
      <BubbleGroup count={a} />
      <span className="bubble-op">{op === '+' ? '+' : '−'}</span>
      <BubbleGroup count={b} fading={op === '-' && hintTier >= 2} />
    </div>
  )
}

const bubbleAddition: GameDef = {
  id: 'bubbleAdd',
  world: 'numbers',
  title: 'Bubble Math',
  emoji: '🫧',
  ages: '5–7',
  roundsPerSession: 5,
  generateRound,
  Display,
}

export default bubbleAddition
