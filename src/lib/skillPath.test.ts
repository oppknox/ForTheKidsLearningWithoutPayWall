import { describe, expect, it } from 'vitest'
import type { Profile } from '../types'
import { nextPathGame, pathStepsFor, WORLD_PATHS } from './skillPath'

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'kid',
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

describe('skillPath', () => {
  it('marks the first unplayed game as next', () => {
    const steps = pathStepsFor('letters', profile())
    expect(steps[0].status).toBe('next')
    expect(steps[0].game.id).toBe(WORLD_PATHS.letters[0])
    expect(steps.slice(1).every((s) => s.status === 'upcoming')).toBe(true)
  })

  it('advances next after a game is played', () => {
    const first = WORLD_PATHS.letters[0]
    const second = WORLD_PATHS.letters[1]
    const p = profile({
      progress: { [first]: { level: 1, streak: 0, totalCorrect: 1 } },
    })
    expect(nextPathGame('letters', p)?.id).toBe(second)
    const steps = pathStepsFor('letters', p)
    expect(steps.find((s) => s.game.id === first)?.status).toBe('done')
    expect(steps.find((s) => s.game.id === second)?.status).toBe('next')
  })
})
