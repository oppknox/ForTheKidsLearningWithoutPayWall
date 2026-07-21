import type { AppState, AvatarConfig, Profile } from '../types'
import { applyCorrect, applyHint, newProgress } from '../lib/progress'
import { applyDayCorrect, dayStatsFor, pruneDailyStats } from '../lib/dailyStats'
import { todayKey } from '../lib/dates'
import { isMissionComplete, MISSION_TARGET, pickDailyMission } from '../lib/dailyMission'
import { applyItemResult, pruneItemMastery } from '../lib/itemMastery'

export type Action =
  | { type: 'addProfile'; name: string; age: number; avatar: AvatarConfig }
  | { type: 'updateProfile'; id: string; patch: Partial<Pick<Profile, 'name' | 'age' | 'avatar'>> }
  | { type: 'deleteProfile'; id: string }
  | { type: 'selectProfile'; id: string | null }
  | {
      type: 'recordCorrect'
      gameId: string
      hintsUsed: number
      stickerPool: string[]
      /** Age-seeded level for a game's very first play; ignored once progress exists. */
      startLevel?: number
      /** Short label of what was practiced (for session recap + parent wins). */
      highlight?: string
      /** Item mastery key e.g. "letter:B", "fact:3x4". */
      itemId?: string
    }
  | { type: 'recordHint'; gameId: string; startLevel?: number }
  | { type: 'completeMission' }
  | { type: 'unlockReward'; rewardId: string; cost: number }
  | { type: 'setMuted'; muted: boolean }
  | { type: 'setVoice'; voiceName: string | null }
  | { type: 'replaceState'; state: AppState }

function updateActive(s: AppState, fn: (p: Profile) => Profile): AppState {
  if (!s.activeProfileId) return s
  return {
    ...s,
    profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? fn(p) : p)),
  }
}

function maybeCompleteMission(p: Profile, gameId: string, date: string): string[] {
  const missionDays = p.missionDays ?? []
  if (missionDays.includes(date)) return missionDays
  const mission = pickDailyMission(p, date)
  if (mission.id !== gameId) return missionDays
  const count = dayStatsFor(p, date).gameCorrect[gameId] ?? 0
  if (count >= MISSION_TARGET || isMissionComplete(p, date)) {
    return Array.from(new Set([...missionDays, date]))
  }
  return missionDays
}

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'addProfile': {
      const profile: Profile = {
        id: crypto.randomUUID(),
        name: a.name,
        age: a.age,
        avatar: a.avatar,
        stars: 0,
        stickers: [],
        progress: {},
        practiceDays: [],
        unlockedRewards: [],
        dailyStats: {},
        missionDays: [],
        itemMastery: {},
      }
      return { ...s, profiles: [...s.profiles, profile] }
    }
    case 'updateProfile':
      return {
        ...s,
        profiles: s.profiles.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)),
      }
    case 'deleteProfile':
      return {
        ...s,
        profiles: s.profiles.filter((p) => p.id !== a.id),
        activeProfileId: s.activeProfileId === a.id ? null : s.activeProfileId,
      }
    case 'selectProfile':
      return { ...s, activeProfileId: a.id }
    case 'recordCorrect':
      return updateActive(s, (p) => {
        const date = todayKey()
        const current = p.progress[a.gameId] ?? newProgress(a.startLevel)
        const result = applyCorrect(current, a.hintsUsed)
        let stickers = p.stickers
        if (result.leveledUp) {
          const next = a.stickerPool.find((st) => !p.stickers.includes(st))
          if (next) stickers = [...p.stickers, next]
        }
        const prevDay = dayStatsFor(p, date)
        const nextDay = applyDayCorrect(
          prevDay,
          a.gameId,
          a.hintsUsed,
          result.leveledUp,
          a.highlight,
        )
        const dailyStats = pruneDailyStats({
          ...(p.dailyStats ?? {}),
          [date]: nextDay,
        })
        let itemMastery = p.itemMastery ?? {}
        if (a.itemId) {
          itemMastery = pruneItemMastery({
            ...itemMastery,
            [a.itemId]: applyItemResult(itemMastery[a.itemId], a.hintsUsed),
          })
        }
        const withDay: Profile = {
          ...p,
          stars: p.stars + result.starsEarned,
          stickers,
          progress: { ...p.progress, [a.gameId]: result.progress },
          practiceDays: Array.from(new Set([...(p.practiceDays ?? []), date])),
          dailyStats,
          itemMastery,
        }
        return {
          ...withDay,
          missionDays: maybeCompleteMission(withDay, a.gameId, date),
        }
      })
    case 'recordHint':
      return updateActive(s, (p) => {
        const current = p.progress[a.gameId] ?? newProgress(a.startLevel)
        return { ...p, progress: { ...p.progress, [a.gameId]: applyHint(current) } }
      })
    case 'completeMission':
      return updateActive(s, (p) => {
        const date = todayKey()
        if ((p.missionDays ?? []).includes(date)) return p
        return { ...p, missionDays: [...(p.missionDays ?? []), date] }
      })
    case 'unlockReward':
      return updateActive(s, (p) => {
        if ((p.unlockedRewards ?? []).includes(a.rewardId) || p.stars < a.cost) return p
        return {
          ...p,
          stars: p.stars - a.cost,
          unlockedRewards: [...(p.unlockedRewards ?? []), a.rewardId],
        }
      })
    case 'setMuted':
      return { ...s, muted: a.muted }
    case 'setVoice':
      return { ...s, voiceName: a.voiceName }
    case 'replaceState':
      return structuredClone(a.state)
  }
}
