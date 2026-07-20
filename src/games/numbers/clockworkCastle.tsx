import type { DisplayProps, GameDef, Round } from '../types'
import { randInt, shuffle } from '../../lib/rng'

export function generateClockRound(level: number): Round {
  const hour = randInt(1, 12)
  const minutes = level <= 2 ? 0 : level <= 4 ? sampleMinute([0, 30]) : sampleMinute([0, 15, 30, 45])
  const label = `${hour}:${String(minutes).padStart(2, '0')}`
  const distractors = new Set<string>()
  while (distractors.size < 2) {
    const h = ((hour + randInt(1, 5) - 1) % 12) + 1
    distractors.add(`${h}:${String(minutes).padStart(2, '0')}`)
  }
  return {
    promptText: 'What time is it?', promptSpeech: 'Clockwork Castle! What time does the clock show?',
    choices: shuffle([label, ...distractors]).map((x) => ({ id: x, label: x })), answerId: label,
    hints: { nudge: `The short hand points near ${hour}.`, explain: `The clock shows ${spokenTime(hour, minutes)}.` },
    payload: { hour, minutes },
  }
}

function sampleMinute(values: number[]): number { return values[randInt(0, values.length - 1)] }
function spokenTime(hour: number, minutes: number): string {
  if (minutes === 0) return `${hour} o'clock`
  if (minutes === 30) return `half past ${hour}`
  if (minutes === 15) return `quarter past ${hour}`
  return `quarter to ${(hour % 12) + 1}`
}

function Display({ round }: DisplayProps) {
  const { hour, minutes } = round.payload as { hour: number; minutes: number }
  const minuteDegrees = minutes * 6
  const hourDegrees = hour * 30 + minutes / 2
  return <div className="learning-clock" role="img" aria-label={`Clock with hour hand near ${hour}`}><span className="clock-hand hour" style={{ transform: `rotate(${hourDegrees}deg)` }} /><span className="clock-hand minute" style={{ transform: `rotate(${minuteDegrees}deg)` }} /><span className="clock-pin" /></div>
}

const clockworkCastle: GameDef = {
  id: 'clockworkCastle', world: 'numbers', title: 'Clockwork Castle', emoji: '🕰️', ages: '7–10',
  roundsPerSession: 5, generateRound: generateClockRound, Display,
}

export default clockworkCastle
