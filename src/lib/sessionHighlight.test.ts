import { describe, expect, it } from 'vitest'
import { highlightFromRound } from './sessionHighlight'
import type { Round } from '../games/types'

describe('highlightFromRound', () => {
  it('prefers the answer label', () => {
    const round: Round = {
      promptText: 'Pop the letter B!',
      promptSpeech: 'Pop B',
      choices: [
        { id: 'B', label: 'B' },
        { id: 'D', label: 'D' },
      ],
      answerId: 'B',
      hints: { nudge: 'B', explain: 'B' },
    }
    expect(highlightFromRound(round)).toBe('B')
  })

  it('strips leading emoji from labels', () => {
    const round: Round = {
      promptText: 'Which begins with B?',
      promptSpeech: 'B',
      choices: [
        { id: 'ball', label: '⚽ ball' },
        { id: 'sun', label: '☀️ sun' },
      ],
      answerId: 'ball',
      hints: { nudge: 'buh', explain: 'ball' },
    }
    expect(highlightFromRound(round)).toBe('ball')
  })
})

describe('highlightFromRound math rounds', () => {
  const base = { promptSpeech: '', hints: { nudge: '', explain: '' } }

  it('shows the equation for addition, not the numeric answer', () => {
    expect(
      highlightFromRound({
        ...base,
        promptText: '15 + 3 = ?',
        choices: [{ id: '18', label: '18' }, { id: '17', label: '17' }],
        answerId: '18',
        payload: { a: 15, b: 3, op: '+' },
      } as Round),
    ).toBe('15 + 3')
  })

  it('shows multiplication with × and counting with a friendly label', () => {
    expect(
      highlightFromRound({
        ...base,
        promptText: '3 × 4 = ?',
        choices: [{ id: '12', label: '12' }],
        answerId: '12',
        payload: { a: 3, b: 4 },
      } as Round),
    ).toBe('3 × 4')
    expect(
      highlightFromRound({
        ...base,
        promptText: 'How many fish?',
        choices: [{ id: '7', label: '7' }],
        answerId: '7',
        payload: { count: 7 },
      } as Round),
    ).toBe('Counting to 7')
  })
})
