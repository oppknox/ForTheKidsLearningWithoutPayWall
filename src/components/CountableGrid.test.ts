import { describe, expect, it } from 'vitest'
import { MAX_FULL_CELLS, shouldUseFullGrid } from './CountableGrid'

describe('CountableGrid thresholds', () => {
  it('uses a full grid for small, teachable arrays', () => {
    expect(shouldUseFullGrid(2, 4)).toBe(true)
    expect(shouldUseFullGrid(3, 4)).toBe(true)
    expect(shouldUseFullGrid(1, 5)).toBe(true)
  })

  it('switches to compact layout past the sensory-safe ceiling', () => {
    expect(shouldUseFullGrid(7, 11)).toBe(false) // parent bug report: 77 gems
    expect(shouldUseFullGrid(6, 6)).toBe(false)
    expect(shouldUseFullGrid(5, 5)).toBe(false) // 25 > MAX_FULL_CELLS
    expect(5 * 5).toBeGreaterThan(MAX_FULL_CELLS)
  })

  it('keeps 3×4 fully visible (classic classroom array)', () => {
    expect(shouldUseFullGrid(3, 4)).toBe(true)
    expect(3 * 4).toBeLessThanOrEqual(MAX_FULL_CELLS)
  })
})
