import { makeFlashCardGame, type FlashCard } from './FlashCardGame'

export function mathFactCards(level: number): FlashCard[] {
  const tables = level <= 1 ? [2, 5] : level === 2 ? [2, 3, 5, 10] : level === 3 ? [3, 4, 6] : level === 4 ? [6, 7, 8] : [7, 8, 9, 11, 12]
  const cards: FlashCard[] = []
  for (const table of tables) {
    for (let factor = 2; factor <= 9; factor++) {
      const answer = table * factor
      cards.push({
        id: `${table}x${factor}`,
        front: `${table} × ${factor}`,
        back: String(answer),
        promptSpeech: `What is ${table} times ${factor}?`,
        answerSpeech: `${table} times ${factor} equals ${answer}.`,
        detail: `${Array.from({ length: factor }, () => table).join(' + ')} = ${answer}`,
      })
    }
  }
  return cards
}

export default makeFlashCardGame({
  id: 'mathFactsFlip', world: 'multiplication', title: 'Math Facts Flip', emoji: '⚡', ages: '7–10', getCards: mathFactCards,
})
