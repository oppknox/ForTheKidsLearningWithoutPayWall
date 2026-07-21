import { describe, expect, it } from 'vitest'
import type { Profile } from '../types'
import { proudLineFor, winsForProfile } from './parentInsights'
import { todayKey } from './dates'

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'kid',
  name: 'Maya',
  age: 6,
  avatar: { creature: 'cat', color: '#88f', accessory: 'bow' },
  stars: 12,
  stickers: ['🦄'],
  progress: { letterPop: { level: 2, streak: 0, totalCorrect: 10 } },
  practiceDays: [],
  unlockedRewards: [],
  dailyStats: {},
  missionDays: [],
  itemMastery: {},
  ...overrides,
})

describe('parentInsights', () => {
  it('writes a proud line for a strong no-hint day', () => {
    const date = todayKey()
    const p = profile({
      dailyStats: {
        [date]: {
          correct: 8,
          perfect: 8,
          games: ['letterPop'],
          levelUps: [],
          highlights: ['B', 'M'],
          gameCorrect: { letterPop: 8 },
        },
      },
    })
    expect(proudLineFor(p, date)).toMatch(/no hints/i)
  })

  it('summarizes week practice from dailyStats', () => {
    const date = todayKey()
    const p = profile({
      dailyStats: {
        [date]: {
          correct: 5,
          perfect: 3,
          games: ['letterPop'],
          levelUps: ['letterPop'],
          highlights: ['B'],
          gameCorrect: { letterPop: 5 },
        },
      },
      practiceDays: [date],
    })
    const wins = winsForProfile(p, date)
    expect(wins.today.correct).toBe(5)
    expect(wins.levelUpTitles).toContain('Letter Pop')
    expect(wins.weekDays).toBeGreaterThanOrEqual(1)
    expect(wins.proudLine).toMatch(/leveled up/i)
  })
})
