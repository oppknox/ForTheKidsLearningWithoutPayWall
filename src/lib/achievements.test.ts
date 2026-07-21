import { describe, expect, it } from 'vitest'
import type { Profile } from '../types'
import { achievementsFor, collectionProgress, nextGoalFor } from './achievements'

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'kid', name: 'Mia', age: 6,
  avatar: { creature: 'fox', color: '#f80', accessory: 'none' },
  stars: 0, stickers: [], progress: {}, practiceDays: [], unlockedRewards: [],
  dailyStats: {}, missionDays: [], itemMastery: {},
  ...overrides,
})

describe('achievements', () => {
  it('starts with an approachable first-answer goal', () => {
    expect(nextGoalFor(profile())?.id).toBe('first-step')
  })

  it('counts different practice days without requiring a streak', () => {
    const badges = achievementsFor(profile({ practiceDays: ['2026-07-01', '2026-07-09', '2026-07-20'] }))
    expect(badges.find((a) => a.id === 'practice-3')?.earned).toBe(true)
  })

  it('builds world collections from answers in that world only', () => {
    const p = profile({ progress: {
      letterPop: { level: 2, streak: 0, totalCorrect: 12 },
      countFish: { level: 2, streak: 0, totalCorrect: 100 },
    } })
    expect(collectionProgress(p, 'letters')).toMatchObject({ correct: 12, earned: 1 })
  })
})
