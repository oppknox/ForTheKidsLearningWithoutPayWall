import { randInt } from '../../lib/rng'
import { itemKey, pickPreferredId } from '../../lib/itemMastery'
import type { RoundContext } from '../types'

export const POOLS: Record<number, { a: [number, number]; b: [number, number] }> = {
  1: { a: [1, 3], b: [1, 5] },
  2: { a: [2, 5], b: [2, 5] },
  3: { a: [2, 9], b: [2, 6] },
  4: { a: [6, 9], b: [6, 9] },
  5: { a: [2, 12], b: [2, 12] },
}

export function drawFactors(level: number): { a: number; b: number } {
  const pool = POOLS[Math.min(Math.max(level, 1), 5)]
  return { a: randInt(...pool.a), b: randInt(...pool.b) }
}

/** Canonical mastery id so 3×4 and 4×3 share progress. */
export function factMasteryId(a: number, b: number): string {
  const [x, y] = a <= b ? [a, b] : [b, a]
  return `${x}x${y}`
}

function inPool(a: number, b: number, pool: { a: [number, number]; b: [number, number] }): boolean {
  return a >= pool.a[0] && a <= pool.a[1] && b >= pool.b[0] && b <= pool.b[1]
}

/** All in-pool factor pairs as mastery keys (may collapse 3×4 and 4×3). */
export function factCandidatesForLevel(level: number): string[] {
  const pool = POOLS[Math.min(Math.max(level, 1), 5)]
  const set = new Set<string>()
  for (let a = pool.a[0]; a <= pool.a[1]; a++) {
    for (let b = pool.b[0]; b <= pool.b[1]; b++) {
      set.add(factMasteryId(a, b))
    }
  }
  return [...set]
}

/**
 * Pick factors for a round: prefer weak mastery facts that still fit the level pool.
 */
export function drawFactorsWithMastery(level: number, ctx?: RoundContext): { a: number; b: number } {
  const pool = POOLS[Math.min(Math.max(level, 1), 5)]
  const recent = (ctx?.recentItemIds ?? [])
    .filter((k) => k.startsWith('fact:'))
    .map((k) => k.slice('fact:'.length))

  const preferred =
    ctx?.preferItemId?.startsWith('fact:')
      ? ctx.preferItemId.slice('fact:'.length)
      : pickPreferredId(ctx?.allMastery, 'fact', factCandidatesForLevel(level), recent)

  if (preferred) {
    const m = /^(\d+)x(\d+)$/.exec(preferred)
    if (m) {
      const x = Number(m[1])
      const y = Number(m[2])
      if (inPool(x, y, pool)) return { a: x, b: y }
      if (inPool(y, x, pool)) return { a: y, b: x }
      // Neither orientation fits this level — fall through to random draw.
    }
  }
  return drawFactors(level)
}

export function factItemId(a: number, b: number): string {
  return itemKey('fact', factMasteryId(a, b))
}

/** Product plus two near-miss distractors kids actually make. */
export function productChoices(a: number, b: number): number[] {
  const product = a * b
  const candidates = [
    product + a,
    product - a,
    product + b,
    product - b,
    a * (b + 1),
    a * (b - 1),
    product + 1,
    product - 1,
  ]
  const options = new Set<number>([product])
  for (const c of candidates) {
    if (options.size >= 3) break
    if (c > 0 && !options.has(c)) options.add(c)
  }
  // Tiny facts like 1×1 starve the near-miss pool — pad upward so there are always 3.
  for (let pad = 1; options.size < 3; pad++) options.add(product + pad)
  return [...options]
}
