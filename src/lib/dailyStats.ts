import type { DayStats, Profile } from '../types'
import { todayKey } from './dates'

export function emptyDay(): DayStats {
  return {
    correct: 0,
    perfect: 0,
    games: [],
    levelUps: [],
    highlights: [],
    gameCorrect: {},
  }
}

const MAX_HIGHLIGHTS = 12

export function dayStatsFor(p: Profile, date = todayKey()): DayStats {
  const raw = p.dailyStats?.[date]
  if (!raw) return emptyDay()
  return {
    correct: raw.correct ?? 0,
    perfect: raw.perfect ?? 0,
    games: Array.isArray(raw.games) ? raw.games : [],
    levelUps: Array.isArray(raw.levelUps) ? raw.levelUps : [],
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    gameCorrect: raw.gameCorrect && typeof raw.gameCorrect === 'object' ? raw.gameCorrect : {},
  }
}

/** Merge one correct answer into a day’s rollup. */
export function applyDayCorrect(
  day: DayStats,
  gameId: string,
  hintsUsed: number,
  leveledUp: boolean,
  highlight?: string,
): DayStats {
  const games = day.games.includes(gameId) ? day.games : [...day.games, gameId]
  const levelUps =
    leveledUp && !day.levelUps.includes(gameId) ? [...day.levelUps, gameId] : day.levelUps
  let highlights = day.highlights
  if (highlight) {
    const clean = highlight.trim().slice(0, 40)
    if (clean && !highlights.includes(clean)) {
      highlights = [...highlights, clean].slice(-MAX_HIGHLIGHTS)
    }
  }
  const gameCorrect = {
    ...day.gameCorrect,
    [gameId]: (day.gameCorrect[gameId] ?? 0) + 1,
  }
  return {
    correct: day.correct + 1,
    perfect: day.perfect + (hintsUsed === 0 ? 1 : 0),
    games,
    levelUps,
    highlights,
    gameCorrect,
  }
}

/** Drop dailyStats older than `keepDays` to keep localStorage small. */
export function pruneDailyStats(
  stats: Record<string, DayStats> | undefined,
  keepDays = 60,
  now = new Date(),
): Record<string, DayStats> {
  if (!stats) return {}
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - keepDays)
  const cutoffKey = todayKey(cutoff)
  const next: Record<string, DayStats> = {}
  for (const [key, value] of Object.entries(stats)) {
    if (key >= cutoffKey) next[key] = value
  }
  return next
}
