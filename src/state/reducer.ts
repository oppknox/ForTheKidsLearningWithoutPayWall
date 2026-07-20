import type { AppState, AvatarConfig, Profile } from '../types'
import { applyCorrect, applyHint, newProgress } from '../lib/progress'

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
    }
  | { type: 'recordHint'; gameId: string; startLevel?: number }
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
        const current = p.progress[a.gameId] ?? newProgress(a.startLevel)
        const result = applyCorrect(current, a.hintsUsed)
        let stickers = p.stickers
        if (result.leveledUp) {
          const next = a.stickerPool.find((st) => !p.stickers.includes(st))
          if (next) stickers = [...p.stickers, next]
        }
        return {
          ...p,
          stars: p.stars + result.starsEarned,
          stickers,
          progress: { ...p.progress, [a.gameId]: result.progress },
          practiceDays: Array.from(new Set([...(p.practiceDays ?? []), new Date().toLocaleDateString('en-CA')])),
        }
      })
    case 'recordHint':
      return updateActive(s, (p) => {
        const current = p.progress[a.gameId] ?? newProgress(a.startLevel)
        return { ...p, progress: { ...p.progress, [a.gameId]: applyHint(current) } }
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
