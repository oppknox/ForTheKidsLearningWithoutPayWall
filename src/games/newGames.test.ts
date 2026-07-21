import { describe, expect, it } from 'vitest'
import { generateShapeRound } from './letters/shapeSafari'
import { generateSoundRound, SOUND_SETS } from './letters/soundGarden'
import { generatePatternRound } from './numbers/patternParade'
import { generateClockRound } from './numbers/clockworkCastle'
import { generateStoryRound } from './numbers/storyProblemTheater'
import { generateFractionRound } from './multiplication/fractionPizza'

const generators = [
  generateShapeRound,
  generateSoundRound,
  generatePatternRound,
  generateClockRound,
  generateStoryRound,
  generateFractionRound,
]

describe('pattern parade answers', () => {
  it('continues ABAB patterns with B and AAB patterns with A', () => {
    for (let i = 0; i < 60; i++) {
      const simple = generatePatternRound(1)
      const seq1 = (simple.payload as { sequence: string[] }).sequence
      // [a,b,a,b,a] → next is b
      expect(simple.answerId).toBe(seq1[1])
      const advanced = generatePatternRound(5)
      const seq2 = (advanced.payload as { sequence: string[] }).sequence
      // [a,a,b,a,a,b] → next is a
      expect(advanced.answerId).toBe(seq2[0])
    }
  })
})

describe('fraction pizza distractors', () => {
  it('never offers a fraction equivalent to the answer', () => {
    for (let i = 0; i < 100; i++) {
      const r = generateFractionRound((i % 5) + 1)
      const [n, d] = r.answerId.split('/').map(Number)
      for (const c of r.choices) {
        if (c.id === r.answerId) continue
        const [cn, cd] = c.id.split('/').map(Number)
        expect(cn * d).not.toBe(n * cd)
      }
    }
  })
})

describe('sound garden A–Z coverage', () => {
  it('includes one beginning-sound set per letter', () => {
    expect(SOUND_SETS).toHaveLength(26)
    const letters = SOUND_SETS.map((s) => s.letter).sort()
    expect(letters.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    for (const set of SOUND_SETS) {
      expect(set.items[0][0].toLowerCase().startsWith(set.letter.toLowerCase()) || set.letter === 'X').toBe(true)
    }
  })

  it('tags rounds with sound mastery item ids', () => {
    const round = generateSoundRound(3)
    expect(round.itemId).toMatch(/^sound:[A-Z]$/)
  })
})

describe('new game round generators', () => {
  for (const generate of generators) {
    it(`${generate.name} always includes exactly one answer`, () => {
      for (let i = 0; i < 100; i++) {
        const round = generate((i % 5) + 1)
        expect(round.choices.filter((choice) => choice.id === round.answerId)).toHaveLength(1)
        expect(new Set(round.choices.map((choice) => choice.id)).size).toBe(round.choices.length)
        expect(round.promptSpeech.length).toBeGreaterThan(5)
      }
    })
  }

  it('uses child-friendly singular grammar for one topped slice', () => {
    for (let i = 0; i < 200; i++) {
      const round = generateFractionRound(1)
      const payload = round.payload as { n: number }
      if (payload.n === 1) {
        expect(round.hints.nudge).toContain('1 slice has toppings')
        return
      }
    }
    throw new Error('Expected to generate a one-slice fraction')
  })
})
