import { describe, it, expect } from 'vitest'
import { ALPHABET } from './letterData'
import letterPop from './letterPop'
import letterMatch from './letterMatch'

describe('letterData', () => {
  it('covers all 26 letters exactly once, each with a word and emoji', () => {
    expect(ALPHABET).toHaveLength(26)
    const letters = ALPHABET.map((e) => e.letter)
    expect(new Set(letters).size).toBe(26)
    for (const e of ALPHABET) {
      expect(e.letter).toMatch(/^[A-Z]$/)
      expect(e.word.length).toBeGreaterThan(0)
      expect(e.emoji.length).toBeGreaterThan(0)
    }
  })
})

describe('letterPop.generateRound', () => {
  it('always includes the answer among the choices with no duplicates', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 30; i++) {
        const r = letterPop.generateRound(level)
        const ids = r.choices.map((c) => c.id)
        expect(ids).toContain(r.answerId)
        expect(new Set(ids).size).toBe(ids.length)
      }
    }
  })

  it('grows the choice count with level: 3, 4, then caps at 5', () => {
    expect(letterPop.generateRound(1).choices).toHaveLength(3)
    expect(letterPop.generateRound(2).choices).toHaveLength(4)
    expect(letterPop.generateRound(3).choices).toHaveLength(5)
    expect(letterPop.generateRound(5).choices).toHaveLength(5)
  })

  it('renders lowercase labels at level 4+', () => {
    const r = letterPop.generateRound(4)
    for (const c of r.choices) expect(c.label).toBe(c.label.toLowerCase())
    const early = letterPop.generateRound(1)
    for (const c of early.choices) expect(c.label).toBe(c.label.toUpperCase())
  })

  it('marks rounds as balloon-styled', () => {
    expect((letterPop.generateRound(1).payload as { balloons: boolean }).balloons).toBe(true)
  })
})

describe('letterMatch.generateRound', () => {
  it('answer is the lowercase of the displayed letter', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 30; i++) {
        const r = letterMatch.generateRound(level)
        const target = (r.payload as { target: string }).target
        expect(target).toMatch(/^[A-Z]$/)
        expect(r.answerId).toBe(target.toLowerCase())
        const ids = r.choices.map((c) => c.id)
        expect(ids).toContain(r.answerId)
        expect(new Set(ids).size).toBe(ids.length)
        for (const c of r.choices) expect(c.label).toMatch(/^[a-z]$/)
      }
    }
  })

  it('grows choices with level and caps at 6', () => {
    expect(letterMatch.generateRound(1).choices).toHaveLength(4)
    expect(letterMatch.generateRound(3).choices).toHaveLength(6)
    expect(letterMatch.generateRound(5).choices).toHaveLength(6)
  })
})
