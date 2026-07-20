import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadState, saveState, normalizeState, STORAGE_KEY } from './storage'
import { DEFAULT_STATE, type AppState } from '../types'

const sampleState: AppState = {
  profiles: [
    {
      id: 'p1',
      name: 'Mia',
      age: 5,
      avatar: { creature: 'fox', color: '#ff8800', accessory: 'bow' },
      stars: 12,
      stickers: ['🦄'],
      progress: { letterPop: { level: 2, streak: 1, totalCorrect: 9 } },
    },
  ],
  activeProfileId: 'p1',
  muted: false,
  voiceName: null,
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('round-trips state through localStorage', () => {
    saveState(sampleState)
    expect(loadState()).toEqual(sampleState)
  })

  it('returns defaults when nothing is stored', () => {
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns defaults on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json!!')
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns defaults on non-object JSON', () => {
    localStorage.setItem(STORAGE_KEY, '"just a string"')
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('loadState result is a fresh copy, not the shared default', () => {
    const a = loadState()
    a.muted = true
    expect(loadState().muted).toBe(false)
    expect(DEFAULT_STATE.muted).toBe(false)
  })

  it('fills in fields missing from older saved states with defaults', () => {
    const legacy = { profiles: [], activeProfileId: null, muted: true }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const loaded = loadState()
    expect(loaded.muted).toBe(true)
    expect(loaded.voiceName).toBeNull()
  })

  it('normalizeState accepts real backups and rejects malformed ones', () => {
    expect(normalizeState(sampleState)).toEqual(sampleState)
    expect(normalizeState(null)).toBeNull()
    expect(normalizeState({ profiles: 'nope' })).toBeNull()
    expect(
      normalizeState({
        profiles: [{ ...sampleState.profiles[0], age: 99 }],
        activeProfileId: null,
        muted: false,
      }),
    ).toBeNull()
  })

  it('saveState never throws when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() => saveState(sampleState)).not.toThrow()
  })
})
