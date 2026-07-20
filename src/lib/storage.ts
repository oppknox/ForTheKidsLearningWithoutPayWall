import { DEFAULT_STATE, type AppState } from '../types'

export const STORAGE_KEY = 'ftk-state-v1'

export function normalizeState(value: unknown): AppState | null {
  if (typeof value !== 'object' || value === null || !Array.isArray((value as AppState).profiles)) return null
  const candidate = value as AppState
  const validProfiles = candidate.profiles.every((profile) =>
    typeof profile?.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.age === 'number' && profile.age >= 3 && profile.age <= 10 &&
    typeof profile.stars === 'number' &&
    Array.isArray(profile.stickers) &&
    typeof profile.progress === 'object' && profile.progress !== null,
  )
  if (!validProfiles) return null
  return { ...structuredClone(DEFAULT_STATE), ...candidate }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_STATE)
    const parsed: unknown = JSON.parse(raw)
    const normalized = normalizeState(parsed)
    if (!normalized) return structuredClone(DEFAULT_STATE)
    // Older saves may predate newer settings fields — fill gaps with defaults.
    return normalized
  } catch {
    return structuredClone(DEFAULT_STATE)
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — the app keeps working in memory.
  }
}
