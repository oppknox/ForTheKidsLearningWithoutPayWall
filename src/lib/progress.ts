import type { SkillProgress } from '../types'

export const STREAK_TO_LEVEL_UP = 3
export const MAX_LEVEL = 5

export interface AnswerResult {
  progress: SkillProgress
  leveledUp: boolean
  starsEarned: number
}

export function newProgress(startLevel = 1): SkillProgress {
  return {
    level: Math.min(Math.max(startLevel, 1), MAX_LEVEL),
    streak: 0,
    totalCorrect: 0,
  }
}

export function applyCorrect(p: SkillProgress, hintsUsed: number): AnswerResult {
  const starsEarned = hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1
  let streak = p.streak + 1
  let level = p.level
  let leveledUp = false
  if (streak >= STREAK_TO_LEVEL_UP) {
    streak = 0
    if (level < MAX_LEVEL) {
      level += 1
      leveledUp = true
    }
  }
  return {
    progress: { level, streak, totalCorrect: p.totalCorrect + 1 },
    leveledUp,
    starsEarned,
  }
}

export function applyHint(p: SkillProgress): SkillProgress {
  return { ...p, streak: 0 }
}
