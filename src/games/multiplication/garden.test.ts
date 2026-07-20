import { describe, it, expect } from 'vitest'
import timesTableGarden, { TABLES_PER_LEVEL } from './timesTableGarden'

describe('timesTableGarden.generateRound', () => {
  it('practices the level\'s times tables with a 2-9 row count', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 40; i++) {
        const r = timesTableGarden.generateRound(level)
        const { a, b } = r.payload as { a: number; b: number }
        expect(TABLES_PER_LEVEL[level]).toContain(b)
        expect(a).toBeGreaterThanOrEqual(2)
        expect(a).toBeLessThanOrEqual(9)
        expect(r.answerId).toBe(String(a * b))
      }
    }
  })

  it('offers 3 distinct positive choices including the product', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 40; i++) {
        const r = timesTableGarden.generateRound(level)
        const nums = r.choices.map((c) => Number(c.id))
        expect(nums).toHaveLength(3)
        expect(new Set(nums).size).toBe(3)
        expect(nums).toContain(Number(r.answerId))
        for (const n of nums) expect(n).toBeGreaterThan(0)
      }
    }
  })

  it('gives a skip-counting nudge that walks the rows', () => {
    for (let i = 0; i < 20; i++) {
      const r = timesTableGarden.generateRound(2)
      const { a, b } = r.payload as { a: number; b: number }
      const expected = Array.from({ length: a }, (_, k) => (k + 1) * b).join(', ')
      expect(r.hints.nudge).toContain(expected)
    }
  })
})
