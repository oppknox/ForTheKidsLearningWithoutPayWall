import { describe, it, expect } from 'vitest'
import { WORDS, generateWordRound, DISTRACTORS_PER_LEVEL } from './wordBuilderLogic'

describe('word list', () => {
  it('every word is lowercase with an emoji picture', () => {
    for (const w of WORDS) {
      expect(w.word).toMatch(/^[a-z]{3,5}$/)
      expect(w.emoji.length).toBeGreaterThan(0)
    }
    const unique = new Set(WORDS.map((w) => w.word))
    expect(unique.size).toBe(WORDS.length)
  })

  it('has enough words at each length for a 5-round session', () => {
    expect(WORDS.filter((w) => w.word.length === 3).length).toBeGreaterThanOrEqual(10)
    expect(WORDS.filter((w) => w.word.length === 4).length).toBeGreaterThanOrEqual(10)
    expect(WORDS.filter((w) => w.word.length === 5).length).toBeGreaterThanOrEqual(8)
  })
})

describe('generateWordRound', () => {
  it('picks word length by level: 3 letters at 1-2, 4 at 3-4, 5 at 5', () => {
    const lengths: Record<number, number> = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 5 }
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 30; i++) {
        const r = generateWordRound(level)
        expect(r.word.word).toHaveLength(lengths[level])
      }
    }
  })

  it('bank contains every letter occurrence of the word plus the level distractor count', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 30; i++) {
        const r = generateWordRound(level)
        const bank = [...r.bank]
        // Remove word letters one occurrence at a time — all must be present.
        for (const letter of r.word.word) {
          const idx = bank.indexOf(letter)
          expect(idx).toBeGreaterThanOrEqual(0)
          bank.splice(idx, 1)
        }
        expect(bank).toHaveLength(DISTRACTORS_PER_LEVEL[level])
        // Distractors are never letters of the word (avoids ambiguous wrong answers).
        for (const d of bank) expect(r.word.word).not.toContain(d)
      }
    }
  })

  it('can exclude words to avoid repeats within a session', () => {
    const exclude = new Set(WORDS.filter((w) => w.word.length === 3).map((w) => w.word))
    const keep = [...exclude][0]
    exclude.delete(keep)
    for (let i = 0; i < 10; i++) {
      expect(generateWordRound(1, exclude).word.word).toBe(keep)
    }
  })
})
