import { makeFlashCardGame, type FlashCard } from './FlashCardGame'

const WORDS = [
  ['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['hat', '🎩'], ['fish', '🐟'],
  ['frog', '🐸'], ['moon', '🌙'], ['star', '⭐'], ['tree', '🌳'], ['book', '📖'],
  ['ship', '🚢'], ['cake', '🎂'], ['train', '🚂'], ['chair', '🪑'], ['smile', '😊'],
  ['the', '👀'], ['and', '➕'], ['you', '👉'], ['see', '👁️'], ['play', '🎮'],
]

export function wordCards(level: number): FlashCard[] {
  const count = Math.min(8 + level * 3, WORDS.length)
  return WORDS.slice(0, count).map(([word, emoji]) => ({
    id: word,
    front: emoji,
    back: word,
    promptSpeech: `What word matches this picture?`,
    answerSpeech: `${word}. ${word.split('').join(', ')} spells ${word}.`,
    detail: word.length <= 4 ? word.split('').join(' · ') : 'Say it with Pip!',
  }))
}

export default makeFlashCardGame({
  id: 'wordFlip', world: 'letters', title: 'Word Flip', emoji: '🃏', ages: '4–7', getCards: wordCards,
})
