import type { Profile } from '../types'
import { gameById } from '../games/registry'
import { dayStatsFor, emptyDay } from './dailyStats'
import { recentDayKeys, todayKey } from './dates'
import { nextGoalFor } from './achievements'

export interface ProfileWins {
  profile: Profile
  today: ReturnType<typeof dayStatsFor>
  weekCorrect: number
  weekDays: number
  practiceDaysTotal: number
  proudLine: string
  gameTitlesToday: string[]
  levelUpTitles: string[]
  nextGoalTitle: string | null
}

function gameTitle(id: string): string {
  return gameById(id)?.title ?? id
}

export function proudLineFor(p: Profile, date = todayKey()): string {
  const today = dayStatsFor(p, date)
  if (today.correct === 0) {
    const total = Object.values(p.progress).reduce((n, g) => n + g.totalCorrect, 0)
    if (total === 0) return `${p.name} is ready for a first adventure.`
    return `${p.name} has answered ${total} questions so far — ready for more today?`
  }
  if (today.levelUps.length > 0) {
    const titles = today.levelUps.map(gameTitle)
    return `${p.name} leveled up in ${titles.join(' & ')} today!`
  }
  if (today.perfect >= 5) {
    return `${p.name} answered ${today.perfect} questions with no hints today.`
  }
  if (today.perfect > 0 && today.perfect === today.correct) {
    return `${p.name} got every answer today without hints — amazing focus!`
  }
  const titles = today.games.map(gameTitle)
  if (titles.length === 1) {
    return `${p.name} practiced ${titles[0]} — ${today.correct} answers today.`
  }
  return `${p.name} answered ${today.correct} questions across ${titles.length} games today.`
}

export function winsForProfile(p: Profile, date = todayKey()): ProfileWins {
  const today = dayStatsFor(p, date)
  const weekKeys = recentDayKeys(7, new Date(date + 'T12:00:00'))
  let weekCorrect = 0
  let weekDays = 0
  for (const key of weekKeys) {
    const day = p.dailyStats?.[key]
    if (!day) continue
    if ((day.correct ?? 0) > 0) {
      weekCorrect += day.correct
      weekDays += 1
    }
  }
  // Fallback for older profiles that only have practiceDays
  if (weekDays === 0) {
    const practiced = new Set(p.practiceDays ?? [])
    weekDays = weekKeys.filter((k) => practiced.has(k)).length
  }

  const goal = nextGoalFor(p)
  return {
    profile: p,
    today,
    weekCorrect,
    weekDays,
    practiceDaysTotal: new Set(p.practiceDays ?? []).size,
    proudLine: proudLineFor(p, date),
    gameTitlesToday: today.games.map(gameTitle),
    levelUpTitles: today.levelUps.map(gameTitle),
    nextGoalTitle: goal ? goal.title : null,
  }
}

export function winsForAll(profiles: Profile[], date = todayKey()): ProfileWins[] {
  return profiles.map((p) => winsForProfile(p, date))
}

export function highlightList(labels: string[], max = 6): string[] {
  return labels.slice(-max)
}

export { emptyDay }
