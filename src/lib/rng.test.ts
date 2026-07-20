import { describe, it, expect } from 'vitest'
import { randInt, shuffle, sample } from './rng'

describe('randInt', () => {
  it('stays within inclusive bounds', () => {
    for (let i = 0; i < 200; i++) {
      const n = randInt(3, 7)
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(7)
      expect(Number.isInteger(n)).toBe(true)
    }
  })

  it('can hit both endpoints', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) seen.add(randInt(1, 2))
    expect(seen.has(1)).toBe(true)
    expect(seen.has(2)).toBe(true)
  })
})

describe('shuffle', () => {
  it('preserves members and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    const out = shuffle(input)
    expect(input).toEqual(copy)
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('sample', () => {
  it('returns n distinct members of the input', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    for (let i = 0; i < 50; i++) {
      const out = sample(input, 3)
      expect(out).toHaveLength(3)
      expect(new Set(out).size).toBe(3)
      for (const item of out) expect(input).toContain(item)
    }
  })
})
