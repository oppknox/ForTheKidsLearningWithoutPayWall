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

describe('setMuted', () => {
  it('toggles the muted flag', () => {
    const s = reducer(structuredClone(DEFAULT_STATE), { type: 'setMuted', muted: true })
    expect(s.muted).toBe(true)
  })
})
