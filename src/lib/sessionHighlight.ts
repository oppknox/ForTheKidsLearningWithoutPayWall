import type { Round } from '../games/types'

/** Short kid-friendly label for what was just practiced. */
export function highlightFromRound(round: Round): string {
  const payload = round.payload as Record<string, unknown> | undefined

  // Math rounds: the equation is what was practiced, never the bare answer.
  if (payload && typeof payload.a === 'number' && typeof payload.b === 'number') {
    const op = payload.op === '+' ? '+' : payload.op === '-' ? '−' : '×'
    return `${payload.a} ${op} ${payload.b}`
  }
  if (payload && typeof payload.count === 'number') {
    return `Counting to ${payload.count}`
  }

  const answer = round.choices.find((c) => c.id === round.answerId)
  if (answer) {
    // Strip emoji-heavy prefixes but keep the useful text
    const label = answer.label.replace(/^\p{Extended_Pictographic}+\s*/u, '').trim()
    const isBareNumber = /^\d+$/.test(label)
    if (!isBareNumber && label.length > 0 && label.length <= 28) return label
    if (
      !isBareNumber &&
      answer.id.length > 0 &&
      answer.id.length <= 20 &&
      !answer.id.includes('-')
    ) {
      return answer.id
    }
  }

  if (payload) {
    if (typeof payload.letter === 'string') return payload.letter
    if (typeof payload.word === 'string') return String(payload.word)
  }

  // Fall back to a trimmed prompt ("3 + 2 = ?" reads fine as-is).
  const text = round.promptText.replace(/\s+/g, ' ').trim()
  return text.length > 32 ? `${text.slice(0, 30)}…` : text
}
