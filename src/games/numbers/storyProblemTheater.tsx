import type { DisplayProps, GameDef, Round } from '../types'
import { randInt, sample, shuffle } from '../../lib/rng'

const SCENES = [
  { thing: 'apples', emoji: '🍎', actor: 'Pip' },
  { thing: 'balloons', emoji: '🎈', actor: 'Mia' },
  { thing: 'shells', emoji: '🐚', actor: 'Leo' },
]

export function generateStoryRound(level: number): Round {
  const scene = sample(SCENES, 1)[0]
  const a = randInt(2, level >= 4 ? 10 : 6)
  const subtract = level >= 3 && Math.random() < 0.45
  const b = randInt(1, subtract ? a - 1 : level >= 4 ? 8 : 4)
  const answer = subtract ? a - b : a + b
  const story = subtract
    ? `${scene.actor} had ${a} ${scene.thing}. ${b} went away. How many are left?`
    : `${scene.actor} had ${a} ${scene.thing} and found ${b} more. How many altogether?`
  const candidates = new Set([answer])
  while (candidates.size < 3) candidates.add(Math.max(0, answer + randInt(-3, 3)))
  return {
    promptText: story, promptSpeech: story,
    choices: shuffle([...candidates]).map((n) => ({ id: String(n), label: String(n) })), answerId: String(answer),
    hints: { nudge: subtract ? 'Act it out by taking some away.' : 'Act it out by putting both groups together.', explain: `${a} ${subtract ? 'minus' : 'plus'} ${b} equals ${answer}.` },
    payload: { emoji: scene.emoji, a, b, subtract },
  }
}

function Display({ round, hintTier }: DisplayProps) {
  const { emoji, a, b, subtract } = round.payload as { emoji: string; a: number; b: number; subtract: boolean }
  return <div className="story-stage"><div>{Array.from({ length: a }, (_, i) => <span key={`a${i}`}>{emoji}</span>)}</div><strong>{subtract ? '−' : '+'}</strong><div className={subtract && hintTier >= 2 ? 'story-away' : ''}>{Array.from({ length: b }, (_, i) => <span key={`b${i}`}>{emoji}</span>)}</div></div>
}

const storyProblemTheater: GameDef = {
  id: 'storyTheater', world: 'multiplication', title: 'Story Problem Theater', emoji: '🎭', ages: '7–10',
  roundsPerSession: 5, generateRound: generateStoryRound, Display,
}

export default storyProblemTheater
