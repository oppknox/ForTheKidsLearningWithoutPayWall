export interface RoundState {
  hintTier: 0 | 1 | 2 | 3
  wrongIds: string[]
  solved: boolean
}

export function initialRound(): RoundState {
  return { hintTier: 0, wrongIds: [], solved: false }
}

export function pick(rs: RoundState, choiceId: string, answerId: string): RoundState {
  if (rs.solved) return rs
  if (choiceId === answerId) return { ...rs, solved: true }
  return {
    hintTier: Math.min(rs.hintTier + 1, 3) as RoundState['hintTier'],
    wrongIds: rs.wrongIds.includes(choiceId) ? rs.wrongIds : [...rs.wrongIds, choiceId],
    solved: false,
  }
}
