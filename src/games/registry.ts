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
import wordBuilder from './letters/wordBuilder'
import timesTableGarden from './multiplication/timesTableGarden'
import rhymeTime from './letters/rhymeTime'
import numberLineFrog from './numbers/numberLineFrog'
import shapeSafari from './letters/shapeSafari'
import soundGarden from './letters/soundGarden'
import patternParade from './numbers/patternParade'
import clockworkCastle from './numbers/clockworkCastle'
import storyProblemTheater from './numbers/storyProblemTheater'
import fractionPizza from './multiplication/fractionPizza'

export const GAMES: GameDef[] = [
  letterPop,
  letterMatch,
  alphabetParade,
  wordBuilder,
  rhymeTime,
  shapeSafari,
  soundGarden,
  countTheFish,
  bubbleAddition,
  numberLineFrog,
  patternParade,
  clockworkCastle,
  storyProblemTheater,
  timesTableGarden,
  arrayBuilder,
  rocketRace,
  fractionPizza,
]

export function gamesForWorld(w: WorldId): GameDef[] {
  return GAMES.filter((g) => g.world === w)
}

export function gameById(id: string): GameDef | undefined {
  return GAMES.find((g) => g.id === id)
}
