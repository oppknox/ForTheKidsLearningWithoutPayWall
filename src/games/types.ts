import type { ComponentType } from 'react'
import type { ItemMastery, WorldId } from '../types'

export interface Hints {
  /** Tier 1: spoken encouragement + a restated clue. */
  nudge: string
  /** Tier 3: spoken explanation shown alongside the revealed answer. */
  explain: string
}

export interface Choice {
  id: string
  label: string
}

export interface Round {
  promptText: string
  promptSpeech: string
  choices: Choice[]
  answerId: string
  hints: Hints
  /** Game-specific display data (fish count, factors, balloon flag...). */
  payload?: unknown
  /**
   * Stable mastery key (e.g. "letter:B", "fact:3x4", "sound:M").
   * When set, progress is tracked per item across games.
   */
  itemId?: string
}

/** Optional context so generators can prefer weak items and avoid recent repeats. */
export interface RoundContext {
  preferItemId?: string
  recentItemIds?: string[]
  allMastery?: Record<string, ItemMastery>
}

export interface DisplayProps {
  round: Round
  hintTier: number
  /** True once the round is answered correctly — lets scenes celebrate (bloom, blast off). */
  solved?: boolean
}

export interface GameDef {
  id: string
  world: WorldId
  title: string
  emoji: string
  ages: string
  roundsPerSession: number
  generateRound(level: number, ctx?: RoundContext): Round
  /** Scene rendered above the answer choices. */
  Display?: ComponentType<DisplayProps>
  /** Non-quiz games (Alphabet Parade) render this instead of the quiz shell. */
  FreePlay?: ComponentType
}
