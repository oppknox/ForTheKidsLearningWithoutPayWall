export type WorldId = 'letters' | 'numbers' | 'multiplication'

export type Creature = 'fox' | 'frog' | 'robot' | 'cat' | 'panda' | 'dino'
export type Accessory = 'none' | 'bow' | 'cap' | 'glasses' | 'crown'

export interface AvatarConfig {
  creature: Creature
  color: string
  accessory: Accessory
}

export interface SkillProgress {
  level: number
  streak: number
  totalCorrect: number
}

export interface Profile {
  id: string
  name: string
  age: number
  avatar: AvatarConfig
  stars: number
  stickers: string[]
  progress: Record<string, SkillProgress>
}

export interface AppState {
  profiles: Profile[]
  activeProfileId: string | null
  muted: boolean
  /** OS voice chosen by the parent; null = automatic best available. */
  voiceName: string | null
}

export const DEFAULT_STATE: AppState = {
  profiles: [],
  activeProfileId: null,
  muted: false,
  voiceName: null,
}
