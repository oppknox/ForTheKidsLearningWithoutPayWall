import { describe, it, expect } from 'vitest'
import countTheFish from './countTheFish'
import bubbleAddition from './bubbleAddition'

const FISH_RANGES: Record<number, [number, number]> = {
  1: [1, 5],
  2: [1, 8],
  3: [1, 10],
  4: [4, 12],
  5: [6, 12],
}

describe('countTheFish.generateRound', () => {
  it('keeps the fish count within the level range', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 40; i++) {
        const r = countTheFish.generateRound(level)
        const count = (r.payload as { count: number }).count
        const [lo, hi] = FISH_RANGES[level]
        expect(count).toBeGreaterThanOrEqual(lo)
        expect(count).toBeLessThanOrEqual(hi)
        expect(r.answerId).toBe(String(count))
      }
    }
  })

  it('offers 3 distinct positive choices near the answer, including it', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 40; i++) {
        const r = countTheFish.generateRound(level)
        const nums = r.choices.map((c) => Number(c.id))
        expect(nums).toHaveLength(3)
        expect(new Set(nums).size).toBe(3)
        expect(nums).toContain(Number(r.answerId))
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(1)
          expect(Math.abs(n - Number(r.answerId))).toBeLessThanOrEqual(3)
        }
      }
    }
  })
})

describe('bubbleAddition.generateRound', () => {
  it('uses addition at levels 1-3 with capped sums', () => {
    const caps: Record<number, number> = { 1: 5, 2: 10, 3: 20 }
    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 40; i++) {
        const r = bubbleAddition.generateRound(level)
        const { a, b, op } = r.payload as { a: number; b: number; op: '+' | '-' }
        expect(op).toBe('+')
        expect(a + b).toBeLessThanOrEqual(caps[level])
        expect(a).toBeGreaterThanOrEqual(1)
        expect(b).toBeGreaterThanOrEqual(1)
        expect(r.answerId).toBe(String(a + b))
      }
    }
  })

  it('uses subtraction at levels 4-5 and never goes negative', () => {
    const caps: Record<number, number> = { 4: 10, 5: 20 }
    for (const level of [4, 5]) {
      for (let i = 0; i < 40; i++) {
        const r = bubbleAddition.generateRound(level)
        const { a, b, op } = r.payload as { a: number; b: number; op: '+' | '-' }
        expect(op).toBe('-')
        expect(a).toBeLessThanOrEqual(caps[level])
        expect(a - b).toBeGreaterThanOrEqual(0)
        expect(r.answerId).toBe(String(a - b))
      }
    }
  })

  it('offers 3 distinct non-negative choices including the answer', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 40; i++) {
        const r = bubbleAddition.generateRound(level)
        const nums = r.choices.map((c) => Number(c.id))
        expect(nums).toHaveLength(3)
        expect(new Set(nums).size).toBe(3)
        expect(nums).toContain(Number(r.answerId))
        for (const n of nums) expect(n).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
