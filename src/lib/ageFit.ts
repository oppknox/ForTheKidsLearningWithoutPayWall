import { MAX_LEVEL } from './progress'

/** Parse a game's display ages label ("3–6", "7-10") into [min, max]. */
export function parseAges(ages: string): [number, number] {
  const nums = ages.match(/\d+/g)?.map(Number) ?? []
  const min = nums[0] ?? 3
  const max = nums[1] ?? min
  return [min, max]
}

/**
 * The level a child first plays a game at, seeded from their age.
 * At/below the range minimum → 1; at/above the maximum → MAX_LEVEL - 1
 * (the top level is always earned, never granted); smooth in between.
 */
export function startingLevel(age: number, [min, max]: [number, number]): number {
  if (age <= min) return 1
  const fraction = Math.min((age - min) / (max - min), 1)
  return 1 + Math.round(fraction * (MAX_LEVEL - 2))
}

export type AgeFit = 'fit' | 'stretch' | 'warmup'

/** How a game's age range relates to this child: right on, above them, or below them. */
export function ageFit(age: number, [min, max]: [number, number]): AgeFit {
  if (age < min) return 'stretch'
  if (age > max) return 'warmup'
  return 'fit'
}
