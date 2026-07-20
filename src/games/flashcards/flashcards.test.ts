import { describe, expect, it } from 'vitest'
import { wordCards } from './wordFlip'
import { numberCards } from './numberFlip'
import { mathFactCards } from './mathFactsFlip'

describe('flash card decks', () => {
  it.each([
    ['words', wordCards],
    ['numbers', numberCards],
    ['math facts', mathFactCards],
  ])('%s provides enough unique cards at every level', (_name, getCards) => {
    for (let level = 1; level <= 5; level++) {
      const cards = getCards(level)
      expect(cards.length).toBeGreaterThanOrEqual(5)
      expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length)
      expect(cards.every((card) => card.front && card.back && card.answerSpeech)).toBe(true)
    }
  })

  it('grows the word and number decks with difficulty', () => {
    expect(wordCards(5).length).toBeGreaterThan(wordCards(1).length)
    expect(numberCards(5).length).toBeGreaterThan(numberCards(1).length)
  })
})
