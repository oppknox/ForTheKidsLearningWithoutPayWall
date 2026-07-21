import { describe, expect, it } from 'vitest'
import type { Profile } from '../types'
import {
  MISSION_TARGET,
  isMissionComplete,
  missionStatus,
  pickDailyMission,
  welcomeBackMessage,
} from './dailyMission'
import { todayKey } from './dates'

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'kid-1',
  name: 'Mia',
  age: 5,
  avatar: { creature: 'fox', color: '#f80', accessory: 'none' },
  stars: 0,
  stickers: [],
  progress: {},
  practiceDays: [],
  unlockedRewards: [],
  dailyStats: {},
  missionDays: [],
  itemMastery: {},
  ...overrides,
})

describe('dailyMission', () => {
  it('picks a stable mission for the same kid and day', () => {
    const p = profile()
    const a = pickDailyMission(p, '2026-07-20')
    const b = pickDailyMission(p, '2026-07-20')
    expect(a.id).toBe(b.id)
  })

  it('can rotate missions across days', () => {
    const p = profile()
    const days = Array.from({ length: 14 }, (_, i) =>
      pickDailyMission(p, `2026-07-${String(i + 1).padStart(2, '0')}`).id,
    )
    expect(new Set(days).size).toBeGreaterThan(1)
  })

  it('marks mission complete after enough answers in the mission game', () => {
    const date = todayKey()
    const mission = pickDailyMission(profile(), date)
    const p = profile({
      dailyStats: {
        [date]: {
          correct: MISSION_TARGET,
          perfect: MISSION_TARGET,
          games: [mission.id],
          levelUps: [],
          highlights: [],
          gameCorrect: { [mission.id]: MISSION_TARGET },
        },
      },
    })
    expect(isMissionComplete(p, date)).toBe(true)
    expect(missionStatus(p, date).complete).toBe(true)
  })

  it('welcomes returning players without guilt', () => {
    const date = todayKey()
    const p = profile({ practiceDays: [date, '2026-07-01', '2026-07-02'] })
    const msg = welcomeBackMessage(p, date)
    expect(msg).toMatch(/Day 3/)
    expect(msg?.toLowerCase()).not.toMatch(/missed|streak broken|forgot/)
  })
})
