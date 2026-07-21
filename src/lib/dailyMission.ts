import type { Profile } from '../types'
import { GAMES, gamesForWorld } from '../games/registry'
import type { GameDef } from '../games/types'
import { ageFit, parseAges } from './ageFit'
import { dayStatsFor } from './dailyStats'
import { todayKey } from './dates'

/** Correct answers in the mission game needed to complete today’s mission. */
export const MISSION_TARGET = 5

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function recommendedWorld(age: number): 'letters' | 'numbers' | 'multiplication' {
  if (age <= 5) return 'letters'
  if (age <= 7) return 'numbers'
  return 'multiplication'
}

/**
 * Stable daily mission for this child: prefers age-fit games in their
 * recommended world, rotating by calendar day so tomorrow feels fresh.
 */
export function pickDailyMission(p: Profile, date = todayKey()): GameDef {
  const world = recommendedWorld(p.age)
  const fit = gamesForWorld(world).filter((g) => ageFit(p.age, parseAges(g.ages)) === 'fit')
  const pool = fit.length > 0 ? fit : gamesForWorld(world)
  const list = pool.length > 0 ? pool : GAMES
  const idx = hashString(`${p.id}:${date}`) % list.length
  return list[idx]
}

export function isMissionComplete(p: Profile, date = todayKey()): boolean {
  if ((p.missionDays ?? []).includes(date)) return true
  const game = pickDailyMission(p, date)
  return (dayStatsFor(p, date).gameCorrect[game.id] ?? 0) >= MISSION_TARGET
}

export function missionStatus(p: Profile, date = todayKey()) {
  const game = pickDailyMission(p, date)
  const correct = dayStatsFor(p, date).gameCorrect[game.id] ?? 0
  const complete = isMissionComplete(p, date)
  return {
    game,
    correct: Math.min(correct, MISSION_TARGET),
    target: MISSION_TARGET,
    complete,
  }
}

/** Soft return copy for the world map — never guilt-trips missed days. */
export function welcomeBackMessage(p: Profile, date = todayKey()): string | null {
  const days = new Set(p.practiceDays ?? [])
  if (days.size === 0) return null
  if (days.has(date)) {
    if (days.size === 1) return `Welcome back, ${p.name}! Your adventure is growing. 🌱`
    return `Welcome back, ${p.name}! Day ${days.size} of playing — rainbow growing 🌈`
  }
  return `Hi ${p.name}! Pip has a new treasure mission for you today. ✨`
}
