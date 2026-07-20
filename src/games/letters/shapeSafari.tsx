import type { DisplayProps, GameDef, Round } from '../types'
import { sample, shuffle } from '../../lib/rng'

const SHAPES = [
  { id: 'triangle', label: '▲', name: 'triangle' },
  { id: 'circle', label: '●', name: 'circle' },
  { id: 'square', label: '■', name: 'square' },
  { id: 'rectangle', label: '▬', name: 'rectangle' },
  { id: 'diamond', label: '◆', name: 'diamond' },
]

export function generateShapeRound(level: number): Round {
  const answer = sample(SHAPES, 1)[0]
  const count = Math.min(3 + Math.floor((level - 1) / 2), 5)
  const choices = shuffle([answer, ...sample(SHAPES.filter((s) => s.id !== answer.id), count - 1)])
  return {
    promptText: `Find the ${answer.name}!`,
    promptSpeech: `Shape Safari! Tap the ${answer.name}.`,
    choices: choices.map((shape) => ({ id: shape.id, label: shape.label })),
    answerId: answer.id,
    hints: {
      nudge: `Look at the sides and corners. Find the ${answer.name}.`,
      explain: `This is the ${answer.name}. Great shape spotting!`,
    },
    payload: { answer: answer.name },
  }
}

function Display({ round, hintTier }: DisplayProps) {
  const { answer } = round.payload as { answer: string }
  return (
    <div className="safari-scene" aria-hidden="true">
      <span>🌴</span><span>🦋</span><span>⛺</span><span>🦜</span><span>🌿</span>
      {hintTier >= 2 && <strong>Pip sees a {answer} hiding nearby!</strong>}
    </div>
  )
}

const shapeSafari: GameDef = {
  id: 'shapeSafari', world: 'numbers', title: 'Shape Safari', emoji: '🦊', ages: '3–6',
  roundsPerSession: 5, generateRound: generateShapeRound, Display,
}

export default shapeSafari
