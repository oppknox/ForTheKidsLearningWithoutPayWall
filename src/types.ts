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

/** Cross-game item mastery (letter B, fact 3×4, word CAT, …). */
export interface ItemMastery {
  seen: number
  perfect: number
  withHelp: number
  /** 0–100; higher = stronger. Weak items are preferred in round generation. */
  strength: number
}

/** Per-day rollup for parent insights and daily missions. Keyed by en-CA date. */
export interface DayStats {
  correct: number
  /** Answers with zero hints — “no help needed.” */
  perfect: number
  games: string[]
  levelUps: string[]
  /** Short labels of what was practiced (e.g. “B”, “3 × 4”). Capped in the reducer. */
  highlights: string[]
  /** Correct answers today, per game id (for daily mission progress). */
  gameCorrect: Record<string, number>
}

export interface Profile {
  id: string
  name: string
  age: number
  avatar: AvatarConfig
  stars: number
  stickers: string[]
  progress: Record<string, SkillProgress>
  /** Local calendar days on which the child practiced. Missing days never erase progress. */
  practiceDays: string[]
  /** Permanent cosmetic rewards bought with earned stars. */
  unlockedRewards: string[]
  /** Daily practice rollups for parent “wins” and mission progress. */
  dailyStats: Record<string, DayStats>
  /** Dates the child finished Pip’s daily mission. */
  missionDays: string[]
  /** Item-level mastery keys like "letter:B", "fact:3x4", "sound:M". */
  itemMastery: Record<string, ItemMastery>
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
