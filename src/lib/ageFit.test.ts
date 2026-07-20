import { describe, it, expect } from 'vitest'
import { parseAges, startingLevel, ageFit } from './ageFit'
import { GAMES } from '../games/registry'
import { MAX_LEVEL } from './progress'

describe('parseAges', () => {
  it('parses every registered game\'s ages label', () => {
    for (const g of GAMES) {
      const [min, max] = parseAges(g.ages)
      expect(min).toBeGreaterThanOrEqual(3)
      expect(max).toBeLessThanOrEqual(10)
      expect(min).toBeLessThanOrEqual(max)
    }
  })

  it('handles en-dash and hyphen', () => {
    expect(parseAges('3–6')).toEqual([3, 6])
    expect(parseAges('7-10')).toEqual([7, 10])
  })
})

describe('startingLevel', () => {
  it('starts at level 1 at or below the range minimum', () => {
    expect(startingLevel(3, [3, 6])).toBe(1)
    expect(startingLevel(3, [5, 7])).toBe(1)
    expect(startingLevel(5, [5, 7])).toBe(1)
  })

  it('starts at level 4 at or above the range maximum — top level must be earned', () => {
    expect(startingLevel(6, [3, 6])).toBe(4)
    expect(startingLevel(10, [3, 6])).toBe(4)
    expect(startingLevel(9, [5, 7])).toBe(4)
  })

  it('scales smoothly in between and never exceeds MAX_LEVEL - 1', () => {
    for (let age = 3; age <= 10; age++) {
      for (const range of [[3, 6], [5, 7], [7, 10], [7, 8]] as [number, number][]) {
        const lvl = startingLevel(age, range)
        expect(lvl).toBeGreaterThanOrEqual(1)
        expect(lvl).toBeLessThanOrEqual(MAX_LEVEL - 1)
      }
    }
    expect(startingLevel(4, [3, 6])).toBe(2)
    expect(startingLevel(5, [3, 6])).toBe(3)
  })
})

describe('ageFit', () => {
  it('classifies fit, stretch (older content), and warmup (younger content)', () => {
    expect(ageFit(4, [3, 6])).toBe('fit')
    expect(ageFit(3, [7, 10])).toBe('stretch')
    expect(ageFit(10, [3, 6])).toBe('warmup')
    expect(ageFit(7, [7, 10])).toBe('fit')
  })
})
