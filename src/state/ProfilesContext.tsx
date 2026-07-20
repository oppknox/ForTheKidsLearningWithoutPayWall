import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import type { AppState, Profile } from '../types'
import { loadState, saveState } from '../lib/storage'
import { setSpeechMuted, setPreferredVoiceName } from '../lib/speech'
import { setSfxMuted } from '../lib/sfx'
import { reducer, type Action } from './reducer'
import { scheduleCloudBackup } from '../lib/cloudSync'

interface Ctx {
  state: AppState
  dispatch: (a: Action) => void
  activeProfile: Profile | null
}

const AppStateContext = createContext<Ctx | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
    setSpeechMuted(state.muted)
    setSfxMuted(state.muted)
    setPreferredVoiceName(state.voiceName)
    scheduleCloudBackup(state)
  }, [state])

  const activeProfile =
    state.profiles.find((p) => p.id === state.activeProfileId) ?? null

  return (
    <AppStateContext.Provider value={{ state, dispatch, activeProfile }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState(): Ctx {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
