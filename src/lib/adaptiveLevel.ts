import { MAX_LEVEL } from './progress'

export interface AdaptiveState {
  level: number
  perfectStreak: number
  struggleStreak: number
  /** True when level rose this step. */
  bumpedUp: boolean
  /** True when level eased this step. */
  easedDown: boolean
}

/**
 * In-session difficulty: three clean answers → nudge harder;
 * two heavy-help answers → ease off. Never leaves 1…MAX_LEVEL.
 */
export function applyAdaptiveAnswer(
  state: AdaptiveState,
  hintsUsed: number,
): AdaptiveState {
  let { level, perfectStreak, struggleStreak } = state
  let bumpedUp = false
  let easedDown = false

  if (hintsUsed === 0) {
    perfectStreak += 1
    struggleStreak = 0
    if (perfectStreak >= 3 && level < MAX_LEVEL) {
      level += 1
      perfectStreak = 0
      bumpedUp = true
    }
  } else if (hintsUsed >= 2) {
    struggleStreak += 1
    perfectStreak = 0
    if (struggleStreak >= 2 && level > 1) {
      level -= 1
      struggleStreak = 0
      easedDown = true
    }
  } else {
    // One gentle hint — reset streaks, keep level.
    perfectStreak = 0
    struggleStreak = 0
  }

  return { level, perfectStreak, struggleStreak, bumpedUp, easedDown }
}

export function initialAdaptive(level: number): AdaptiveState {
  return {
    level: Math.min(Math.max(level, 1), MAX_LEVEL),
    perfectStreak: 0,
    struggleStreak: 0,
    bumpedUp: false,
    easedDown: false,
  }
}
