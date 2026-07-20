import { describe, it, expect } from 'vitest'
import rhymeTime, { RHYME_FAMILIES } from './rhymeTime'

function familyOf(word: string): string | undefined {
  return RHYME_FAMILIES.find((f) => f.words.some((w) => w.word === word))?.id
}

describe('rhyme families', () => {
  it('every family has at least 2 words, all with emoji, no word in two families', () => {
    const seen = new Set<string>()
    for (const f of RHYME_FAMILIES) {
      expect(f.words.length).toBeGreaterThanOrEqual(2)
      for (const w of f.words) {
        expect(w.emoji.length).toBeGreaterThan(0)
        expect(w.word).toMatch(/^[a-z]+$/)
        expect(seen.has(w.word)).toBe(false)
        seen.add(w.word)
      }
    }
    expect(RHYME_FAMILIES.length).toBeGreaterThanOrEqual(10)
  })
})

describe('rhymeTime.generateRound', () => {
  it('answer rhymes with the target (same family); distractors never do', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 40; i++) {
        const r = rhymeTime.generateRound(level)
        const target = (r.payload as { target: { word: string } }).target
        const targetFamily = familyOf(target.word)
        expect(targetFamily).toBeDefined()
        for (const c of r.choices) {
          const w = c.id
          expect(w).not.toBe(target.word)
          if (w === r.answerId) expect(familyOf(w)).toBe(targetFamily)
          else expect(familyOf(w)).not.toBe(targetFamily)
        }
      }
    }
  })

  it('choice count grows with level: 2, 3, then 4', () => {
    expect(rhymeTime.generateRound(1).choices).toHaveLength(2)
    expect(rhymeTime.generateRound(2).choices).toHaveLength(3)
    expect(rhymeTime.generateRound(3).choices).toHaveLength(4)
    expect(rhymeTime.generateRound(5).choices).toHaveLength(4)
  })

  it('never repeats a word within a round', () => {
    for (let i = 0; i < 40; i++) {
      const r = rhymeTime.generateRound(5)
      const ids = r.choices.map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
