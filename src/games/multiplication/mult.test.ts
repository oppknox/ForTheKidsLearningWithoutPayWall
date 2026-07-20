import { describe, it, expect } from 'vitest'
import arrayBuilder from './arrayBuilder'
import rocketRace from './rocketRace'

const POOLS: Record<number, { a: [number, number]; b: [number, number] }> = {
  1: { a: [1, 3], b: [1, 5] },
  2: { a: [2, 5], b: [2, 5] },
  3: { a: [2, 9], b: [2, 6] },
  4: { a: [6, 9], b: [6, 9] },
  5: { a: [2, 12], b: [2, 12] },
}

for (const game of [arrayBuilder, rocketRace]) {
  describe(`${game.id}.generateRound`, () => {
    it('draws factors from the level pool and answers with the product', () => {
      for (let level = 1; level <= 5; level++) {
        for (let i = 0; i < 40; i++) {
          const r = game.generateRound(level)
          const { a, b } = r.payload as { a: number; b: number }
          const pool = POOLS[level]
          expect(a).toBeGreaterThanOrEqual(pool.a[0])
          expect(a).toBeLessThanOrEqual(pool.a[1])
          expect(b).toBeGreaterThanOrEqual(pool.b[0])
          expect(b).toBeLessThanOrEqual(pool.b[1])
          expect(r.answerId).toBe(String(a * b))
        }
      }
    })

    it('offers 3 distinct positive choices including the product', () => {
      for (let level = 1; level <= 5; level++) {
        for (let i = 0; i < 40; i++) {
          const r = game.generateRound(level)
          const nums = r.choices.map((c) => Number(c.id))
          expect(nums).toHaveLength(3)
          expect(new Set(nums).size).toBe(3)
          expect(nums).toContain(Number(r.answerId))
          for (const n of nums) expect(n).toBeGreaterThan(0)
        }
      }
    })
  })
}

describe('rocketRace skip-counting hint', () => {
  it('counts up by the second factor', () => {
    for (let i = 0; i < 20; i++) {
      const r = rocketRace.generateRound(3)
      const { a, b } = r.payload as { a: number; b: number }
      const expected = Array.from({ length: a }, (_, k) => (k + 1) * b).join(', ')
      expect(r.hints.nudge).toContain(expected)
    }
  })
})
