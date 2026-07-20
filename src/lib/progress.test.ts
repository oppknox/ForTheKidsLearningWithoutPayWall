import { describe, it, expect } from 'vitest'
import {
  applyCorrect,
  applyHint,
  newProgress,
  STREAK_TO_LEVEL_UP,
  MAX_LEVEL,
} from './progress'

describe('newProgress', () => {
  it('starts at level 1 with no streak', () => {
    expect(newProgress()).toEqual({ level: 1, streak: 0, totalCorrect: 0 })
  })
})

describe('applyCorrect', () => {
  it('awards 3 stars with no hints, 2 with one hint, 1 otherwise', () => {
    expect(applyCorrect(newProgress(), 0).starsEarned).toBe(3)
    expect(applyCorrect(newProgress(), 1).starsEarned).toBe(2)
    expect(applyCorrect(newProgress(), 2).starsEarned).toBe(1)
    expect(applyCorrect(newProgress(), 3).starsEarned).toBe(1)
  })

  it('increments streak and totalCorrect', () => {
    const r = applyCorrect({ level: 1, streak: 0, totalCorrect: 4 }, 0)
    expect(r.progress.streak).toBe(1)
    expect(r.progress.totalCorrect).toBe(5)
    expect(r.leveledUp).toBe(false)
  })

  it('levels up when streak reaches the threshold, resetting streak', () => {
    const r = applyCorrect(
      { level: 2, streak: STREAK_TO_LEVEL_UP - 1, totalCorrect: 10 },
      0,
    )
    expect(r.leveledUp).toBe(true)
    expect(r.progress.level).toBe(3)
    expect(r.progress.streak).toBe(0)
  })

  it('never levels past MAX_LEVEL and does not report leveledUp at cap', () => {
    const r = applyCorrect(
      { level: MAX_LEVEL, streak: STREAK_TO_LEVEL_UP - 1, totalCorrect: 50 },
      0,
    )
    expect(r.progress.level).toBe(MAX_LEVEL)
    expect(r.leveledUp).toBe(false)
    expect(r.progress.streak).toBe(0)
  })
})

describe('applyHint', () => {
  it('resets streak and nothing else', () => {
    const p = { level: 3, streak: 2, totalCorrect: 20 }
    expect(applyHint(p)).toEqual({ level: 3, streak: 0, totalCorrect: 20 })
  })
})
