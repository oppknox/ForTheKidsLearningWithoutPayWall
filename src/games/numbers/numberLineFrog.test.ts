import { describe, it, expect } from 'vitest'
import numberLineFrog from './numberLineFrog'

describe('numberLineFrog.generateRound', () => {
  it('levels 1-2 are addition with capped sums (5, then 10)', () => {
    const caps: Record<number, number> = { 1: 5, 2: 10 }
    for (const level of [1, 2]) {
      for (let i = 0; i < 40; i++) {
        const r = numberLineFrog.generateRound(level)
        const { start, delta, op } = r.payload as { start: number; delta: number; op: '+' | '-' }
        expect(op).toBe('+')
        expect(start + delta).toBeLessThanOrEqual(caps[level])
        expect(start).toBeGreaterThanOrEqual(0)
        expect(delta).toBeGreaterThanOrEqual(1)
        expect(r.answerId).toBe(String(start + delta))
      }
    }
  })

  it('level 3 is subtraction within 10, never negative', () => {
    for (let i = 0; i < 40; i++) {
      const r = numberLineFrog.generateRound(3)
      const { start, delta, op } = r.payload as { start: number; delta: number; op: '+' | '-' }
      expect(op).toBe('-')
      expect(start).toBeLessThanOrEqual(10)
      expect(start - delta).toBeGreaterThanOrEqual(0)
      expect(r.answerId).toBe(String(start - delta))
    }
  })

  it('levels 4-5 mix operations and stay within 15 / 20', () => {
    const caps: Record<number, number> = { 4: 15, 5: 20 }
    for (const level of [4, 5]) {
      const opsSeen = new Set<string>()
      for (let i = 0; i < 60; i++) {
        const r = numberLineFrog.generateRound(level)
        const { start, delta, op } = r.payload as { start: number; delta: number; op: '+' | '-' }
        opsSeen.add(op)
        const answer = op === '+' ? start + delta : start - delta
        expect(answer).toBeGreaterThanOrEqual(0)
        expect(answer).toBeLessThanOrEqual(caps[level])
        expect(Math.max(start, answer)).toBeLessThanOrEqual(caps[level])
        expect(r.answerId).toBe(String(answer))
      }
      expect(opsSeen).toEqual(new Set(['+', '-']))
    }
  })

  it('offers 3 distinct in-range choices including the answer', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 40; i++) {
        const r = numberLineFrog.generateRound(level)
        const nums = r.choices.map((c) => Number(c.id))
        expect(nums).toHaveLength(3)
        expect(new Set(nums).size).toBe(3)
        expect(nums).toContain(Number(r.answerId))
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(0)
          expect(n).toBeLessThanOrEqual(20)
        }
      }
    }
  })
})
