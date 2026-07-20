import type { WorldId } from '../types'
import type { GameDef } from './types'

export const WORLDS: Record<
  WorldId,
  { title: string; emoji: string; tagline: string }
> = {
  letters: {
    title: 'Letter Land',
    emoji: '🎈',
    tagline: 'Pop, match, and sing the ABCs!',
  },
  numbers: {
    title: 'Number Ocean',
    emoji: '🐠',
    tagline: 'Count and add with splashy friends!',
  },
  multiplication: {
    title: 'Multiplication Mountain',
    emoji: '🏔️',
    tagline: 'Climb to times-table triumph!',
  },
}

export const STICKER_POOL: string[] = [
  '🦄', '🚀', '🌈', '🐬', '🦖', '🍩', '⚽', '🎸',
  '🐙', '🛸', '🧁', '🦋', '🐢', '🎨', '🤖', '🍉',
  '🦁', '⛵', '🎪', '🐧', '🌟', '🪁', '🦜', '🏆',
]

import letterPop from './letters/letterPop'
import letterMatch from './letters/letterMatch'
import alphabetParade from './letters/alphabetParade'
import countTheFish from './numbers/countTheFish'
import bubbleAddition from './numbers/bubbleAddition'
import arrayBuilder from './multiplication/arrayBuilder'
import rocketRace from './multiplication/rocketRace'

export const GAMES: GameDef[] = [
  letterPop,
  letterMatch,
  alphabetParade,
  countTheFish,
  bubbleAddition,
  arrayBuilder,
  rocketRace,
]

export function gamesForWorld(w: WorldId): GameDef[] {
  return GAMES.filter((g) => g.world === w)
}

export function gameById(id: string): GameDef | undefined {
  return GAMES.find((g) => g.id === id)
}
