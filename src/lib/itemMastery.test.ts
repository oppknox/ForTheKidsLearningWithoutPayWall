import { describe, expect, it } from 'vitest'
import {
  applyItemResult,
  emptyItem,
  itemKey,
  pickPreferredId,
  stillGrowingLabels,
  weaknessScore,
} from './itemMastery'
import type { Profile } from '../types'

describe('itemMastery', () => {
  it('grows strength faster on perfect answers', () => {
    const perfect = applyItemResult(emptyItem(), 0)
    const helped = applyItemResult(emptyItem(), 2)
    expect(perfect.strength).toBeGreaterThan(helped.strength)
    expect(perfect.perfect).toBe(1)
    expect(helped.withHelp).toBe(1)
  })

  it('prefers weak items over strong ones', () => {
    const mastery = {
      [itemKey('letter', 'A')]: { seen: 5, perfect: 5, withHelp: 0, strength: 90 },
      [itemKey('letter', 'B')]: { seen: 2, perfect: 0, withHelp: 2, strength: 10 },
    }
    // Run a few times — B should win most often among known items
    let bWins = 0
    for (let i = 0; i < 30; i++) {
      if (pickPreferredId(mastery, 'letter', ['A', 'B']) === 'B') bWins++
    }
    expect(bWins).toBeGreaterThan(18)
  })

  it('prefers unseen items highly', () => {
    const mastery = {
      [itemKey('letter', 'A')]: { seen: 5, perfect: 5, withHelp: 0, strength: 90 },
    }
    let cWins = 0
    for (let i = 0; i < 20; i++) {
      if (pickPreferredId(mastery, 'letter', ['A', 'C']) === 'C') cWins++
    }
    expect(cWins).toBeGreaterThan(12)
  })

  it('scores unseen as weakest', () => {
    expect(weaknessScore(undefined)).toBe(1)
    expect(weaknessScore({ seen: 3, perfect: 3, withHelp: 0, strength: 100 })).toBe(0)
  })

  it('lists still-growing items for parents', () => {
    const p: Profile = {
      id: '1',
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
      itemMastery: {
        'letter:B': { seen: 3, perfect: 0, withHelp: 3, strength: 20 },
        'fact:3x4': { seen: 4, perfect: 4, withHelp: 0, strength: 95 },
        'letter:M': { seen: 2, perfect: 0, withHelp: 2, strength: 30 },
      },
    }
    const labels = stillGrowingLabels(p, 3)
    expect(labels).toContain('B')
    expect(labels).toContain('M')
    expect(labels.join(' ')).not.toMatch(/3/)
  })
})
