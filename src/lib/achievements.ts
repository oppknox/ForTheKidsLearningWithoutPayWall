import type { Profile, WorldId } from '../types'
import { gamesForWorld, GAMES } from '../games/registry'

export interface Achievement {
  id: string
  emoji: string
  title: string
  description: string
  earned: boolean
  progress: number
  target: number
}

const totalCorrect = (p: Profile) => Object.values(p.progress).reduce((n, g) => n + g.totalCorrect, 0)
const explored = (p: Profile) => Object.values(p.progress).filter((g) => g.totalCorrect > 0).length
const worldExplored = (p: Profile, world: WorldId) =>
  gamesForWorld(world).filter((g) => (p.progress[g.id]?.totalCorrect ?? 0) > 0).length

function badge(id: string, emoji: string, title: string, description: string, progress: number, target: number): Achievement {
  return { id, emoji, title, description, progress: Math.min(progress, target), target, earned: progress >= target }
}

export function achievementsFor(p: Profile): Achievement[] {
  const correct = totalCorrect(p)
  const days = new Set(p.practiceDays ?? []).size
  const perfectLevels = Object.values(p.progress).filter((g) => g.level >= 2).length
  return [
    badge('first-step', '🌟', 'First Step', 'Answer your first question.', correct, 1),
    badge('curious', '🧭', 'Curious Explorer', 'Try 5 different games.', explored(p), 5),
    badge('letter-hero', '🎈', 'Letter Land Hero', 'Explore every Letter Land game.', worldExplored(p, 'letters'), gamesForWorld('letters').length),
    badge('ocean-hero', '🐬', 'Ocean Explorer', 'Explore every Number Ocean game.', worldExplored(p, 'numbers'), gamesForWorld('numbers').length),
    badge('mountain-hero', '🏔️', 'Mountain Climber', 'Explore every Math Mountain game.', worldExplored(p, 'multiplication'), gamesForWorld('multiplication').length),
    badge('level-up', '🚀', 'Level-Up Legend', 'Level up in 3 different games.', perfectLevels, 3),
    badge('practice-3', '🌱', 'Growing Strong', 'Practice on 3 different days.', days, 3),
    badge('practice-7', '🌈', 'Rainbow Week', 'Practice on 7 different days—no streak required!', days, 7),
    badge('answer-25', '🏆', 'Brain Power', 'Answer 25 questions.', correct, 25),
    badge('answer-100', '👑', 'Century Star', 'Answer 100 questions.', correct, 100),
  ]
}

export function nextGoalFor(p: Profile): Achievement | null {
  return achievementsFor(p).find((a) => !a.earned) ?? null
}

export function collectionProgress(p: Profile, world: WorldId) {
  const games = gamesForWorld(world)
  const correct = games.reduce((sum, game) => sum + (p.progress[game.id]?.totalCorrect ?? 0), 0)
  const milestones = [5, 15, 30]
  return { correct, milestones, earned: milestones.filter((n) => correct >= n).length }
}

export const totalGameCount = GAMES.length
