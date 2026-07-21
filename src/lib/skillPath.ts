import type { Profile, WorldId } from '../types'
import { gameById } from '../games/registry'
import type { GameDef } from '../games/types'

/**
 * Suggested learning order per world — guidance only, never locked.
 * Explore → recognize → sound/match → build → fluency.
 */
export const WORLD_PATHS: Record<WorldId, string[]> = {
  letters: [
    'alphabetParade',
    'letterPop',
    'soundGarden',
    'letterMatch',
    'rhymeTime',
    'wordBuilder',
    'wordFlip',
  ],
  numbers: [
    'countFish',
    'shapeSafari',
    'patternParade',
    'numberFlip',
    'bubbleAddition',
    'numberLineFrog',
    'clockworkCastle',
    'storyProblemTheater',
  ],
  multiplication: [
    'timesTableGarden',
    'arrayBuilder',
    'rocketRace',
    'mathFactsFlip',
    'fractionPizza',
    'clockworkCastle',
    'storyProblemTheater',
  ],
}

export type PathStepStatus = 'done' | 'next' | 'upcoming'

export interface PathStep {
  game: GameDef
  status: PathStepStatus
  index: number
}

export function pathStepsFor(world: WorldId, profile: Profile): PathStep[] {
  const ids = WORLD_PATHS[world] ?? []
  const steps: PathStep[] = []
  let foundNext = false

  for (let i = 0; i < ids.length; i++) {
    const game = gameById(ids[i])
    if (!game) continue
    const played = (profile.progress[game.id]?.totalCorrect ?? 0) > 0
    let status: PathStepStatus
    if (played) {
      status = 'done'
    } else if (!foundNext) {
      status = 'next'
      foundNext = true
    } else {
      status = 'upcoming'
    }
    steps.push({ game, status, index: steps.length })
  }
  return steps
}

export function nextPathGame(world: WorldId, profile: Profile): GameDef | null {
  return pathStepsFor(world, profile).find((s) => s.status === 'next')?.game ?? null
}
