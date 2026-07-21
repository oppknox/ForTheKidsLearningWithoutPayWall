import { describe, it, expect } from 'vitest'
import { reducer } from './reducer'
import { DEFAULT_STATE, type AppState, type AvatarConfig } from '../types'

const avatar: AvatarConfig = { creature: 'fox', color: '#ff8800', accessory: 'none' }

function stateWithChild(): AppState {
  const s = reducer(structuredClone(DEFAULT_STATE), {
    type: 'addProfile',
    name: 'Mia',
    age: 5,
    avatar,
  })
  return reducer(s, { type: 'selectProfile', id: s.profiles[0].id })
}

describe('profile management', () => {
  it('adds a profile with fresh stats', () => {
    const s = reducer(structuredClone(DEFAULT_STATE), {
      type: 'addProfile',
      name: 'Mia',
      age: 5,
      avatar,
    })
    expect(s.profiles).toHaveLength(1)
    const p = s.profiles[0]
    expect(p.name).toBe('Mia')
    expect(p.age).toBe(5)
    expect(p.stars).toBe(0)
    expect(p.stickers).toEqual([])
    expect(p.progress).toEqual({})
    expect(p.practiceDays).toEqual([])
    expect(p.unlockedRewards).toEqual([])
    expect(p.dailyStats).toEqual({})
    expect(p.missionDays).toEqual([])
    expect(p.itemMastery).toEqual({})
    expect(p.id).toBeTruthy()
  })

  it('updates name/age/avatar via patch', () => {
    let s = stateWithChild()
    const id = s.profiles[0].id
    s = reducer(s, { type: 'updateProfile', id, patch: { name: 'Max', age: 7 } })
    expect(s.profiles[0].name).toBe('Max')
    expect(s.profiles[0].age).toBe(7)
  })

  it('deleting the active profile clears the selection', () => {
    let s = stateWithChild()
    const id = s.profiles[0].id
    s = reducer(s, { type: 'deleteProfile', id })
    expect(s.profiles).toHaveLength(0)
    expect(s.activeProfileId).toBeNull()
  })
})

describe('treasure rewards', () => {
  it('records a practice day only once', () => {
    let s = stateWithChild()
    const action = { type: 'recordCorrect' as const, gameId: 'letterPop', hintsUsed: 0, stickerPool: [] }
    s = reducer(s, action)
    s = reducer(s, action)
    expect(s.profiles[0].practiceDays).toHaveLength(1)
  })

  it('unlocks a permanent reward once and spends stars once', () => {
    let s = stateWithChild()
    s.profiles[0].stars = 50
    s = reducer(s, { type: 'unlockReward', rewardId: 'sunset', cost: 30 })
    expect(s.profiles[0].stars).toBe(20)
    expect(s.profiles[0].unlockedRewards).toEqual(['sunset'])
    s = reducer(s, { type: 'unlockReward', rewardId: 'sunset', cost: 30 })
    expect(s.profiles[0].stars).toBe(20)
  })
})

describe('recordCorrect', () => {
  it('creates progress on first play and awards stars', () => {
    const s = reducer(stateWithChild(), {
      type: 'recordCorrect',
      gameId: 'letterPop',
      hintsUsed: 0,
      stickerPool: ['🦄'],
    })
    const p = s.profiles[0]
    expect(p.progress.letterPop.totalCorrect).toBe(1)
    expect(p.progress.letterPop.streak).toBe(1)
    expect(p.stars).toBe(3)
  })

  it('rolls up daily stats and highlights for parent wins', () => {
    let s = stateWithChild()
    s = reducer(s, {
      type: 'recordCorrect',
      gameId: 'letterPop',
      hintsUsed: 0,
      stickerPool: [],
      highlight: 'B',
    })
    s = reducer(s, {
      type: 'recordCorrect',
      gameId: 'letterPop',
      hintsUsed: 1,
      stickerPool: [],
      highlight: 'M',
    })
    const days = Object.values(s.profiles[0].dailyStats)
    expect(days).toHaveLength(1)
    const day = days[0]
    expect(day.correct).toBe(2)
    expect(day.perfect).toBe(1)
    expect(day.games).toEqual(['letterPop'])
    expect(day.highlights).toEqual(['B', 'M'])
    expect(day.gameCorrect.letterPop).toBe(2)
  })

  it('tracks item-level mastery keys', () => {
    let s = stateWithChild()
    s = reducer(s, {
      type: 'recordCorrect',
      gameId: 'letterPop',
      hintsUsed: 0,
      stickerPool: [],
      itemId: 'letter:B',
    })
    s = reducer(s, {
      type: 'recordCorrect',
      gameId: 'letterPop',
      hintsUsed: 2,
      stickerPool: [],
      itemId: 'letter:B',
    })
    const item = s.profiles[0].itemMastery['letter:B']
    expect(item.seen).toBe(2)
    expect(item.perfect).toBe(1)
    expect(item.withHelp).toBe(1)
    expect(item.strength).toBeGreaterThan(0)
  })

  it('grants the first unowned sticker on level-up', () => {
    let s = stateWithChild()
    for (let i = 0; i < 3; i++) {
      s = reducer(s, {
        type: 'recordCorrect',
        gameId: 'letterPop',
        hintsUsed: 0,
        stickerPool: ['🦄', '🚀'],
      })
    }
    const p = s.profiles[0]
    expect(p.progress.letterPop.level).toBe(2)
    expect(p.stickers).toEqual(['🦄'])
    // Next level-up grants the next sticker, not a duplicate.
    for (let i = 0; i < 3; i++) {
      s = reducer(s, {
        type: 'recordCorrect',
        gameId: 'letterPop',
        hintsUsed: 0,
        stickerPool: ['🦄', '🚀'],
      })
    }
    expect(s.profiles[0].stickers).toEqual(['🦄', '🚀'])
  })

  it('is a no-op when no profile is active', () => {
    const s = reducer(structuredClone(DEFAULT_STATE), {
      type: 'recordCorrect',
      gameId: 'letterPop',
      hintsUsed: 0,
      stickerPool: [],
    })
    expect(s).toEqual(DEFAULT_STATE)
  })
})

describe('age-seeded starting levels', () => {
  it('recordCorrect seeds first-play progress at the given startLevel', () => {
    const s = reducer(stateWithChild(), {
      type: 'recordCorrect',
      gameId: 'bubbleAdd',
      hintsUsed: 0,
      stickerPool: [],
      startLevel: 4,
    })
    expect(s.profiles[0].progress.bubbleAdd.level).toBe(4)
    expect(s.profiles[0].progress.bubbleAdd.streak).toBe(1)
  })

  it('recordHint seeds first-play progress at the given startLevel', () => {
    const s = reducer(stateWithChild(), {
      type: 'recordHint',
      gameId: 'bubbleAdd',
      startLevel: 3,
    })
    expect(s.profiles[0].progress.bubbleAdd.level).toBe(3)
  })

  it('startLevel never overrides existing progress', () => {
    let s = reducer(stateWithChild(), {
      type: 'recordCorrect',
      gameId: 'bubbleAdd',
      hintsUsed: 0,
      stickerPool: [],
      startLevel: 2,
    })
    s = reducer(s, {
      type: 'recordCorrect',
      gameId: 'bubbleAdd',
      hintsUsed: 0,
      stickerPool: [],
      startLevel: 4,
    })
    expect(s.profiles[0].progress.bubbleAdd.level).toBe(2)
  })
})

describe('recordHint', () => {
  it('resets the streak for that game', () => {
    let s = reducer(stateWithChild(), {
      type: 'recordCorrect',
      gameId: 'countFish',
      hintsUsed: 0,
      stickerPool: [],
    })
    expect(s.profiles[0].progress.countFish.streak).toBe(1)
    s = reducer(s, { type: 'recordHint', gameId: 'countFish' })
    expect(s.profiles[0].progress.countFish.streak).toBe(0)
  })
})

describe('setVoice', () => {
  it('stores a chosen voice name and can clear back to automatic', () => {
    let s = reducer(structuredClone(DEFAULT_STATE), { type: 'setVoice', voiceName: 'Samantha' })
    expect(s.voiceName).toBe('Samantha')
    s = reducer(s, { type: 'setVoice', voiceName: null })
    expect(s.voiceName).toBeNull()
  })
})

describe('setMuted', () => {
  it('toggles the muted flag', () => {
    const s = reducer(structuredClone(DEFAULT_STATE), { type: 'setMuted', muted: true })
    expect(s.muted).toBe(true)
  })
})
