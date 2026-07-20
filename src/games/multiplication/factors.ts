import { randInt } from '../../lib/rng'

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
  return [...options]
}
