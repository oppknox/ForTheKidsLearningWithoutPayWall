import { makeFlashCardGame, type FlashCard } from './FlashCardGame'

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']

export function numberCards(level: number): FlashCard[] {
  const maximum = level <= 1 ? 5 : level === 2 ? 10 : 20
  const cards: FlashCard[] = []
  for (let number = 1; number <= maximum; number++) {
    const quantity = number <= 10 ? '●'.repeat(number) : `${number - 1} + 1`
    cards.push({
      id: `number-${number}`,
      front: quantity,
      back: String(number),
      promptSpeech: number <= 10 ? 'How many dots do you see?' : `What number is one more than ${number - 1}?`,
      answerSpeech: `${number}. The number word is ${NUMBER_WORDS[number]}.`,
      detail: NUMBER_WORDS[number],
    })
  }
  return cards
}

export default makeFlashCardGame({
  id: 'numberFlip', world: 'numbers', title: 'Number Flip', emoji: '🔢', ages: '3–7', getCards: numberCards,
})
