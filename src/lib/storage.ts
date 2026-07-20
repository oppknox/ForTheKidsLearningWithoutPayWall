import { DEFAULT_STATE, type AppState } from '../types'

export const STORAGE_KEY = 'ftk-state-v1'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_STATE)
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray((parsed as AppState).profiles)
    ) {
      return structuredClone(DEFAULT_STATE)
    }
    // Older saves may predate newer settings fields — fill gaps with defaults.
    return { ...structuredClone(DEFAULT_STATE), ...(parsed as AppState) }
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
