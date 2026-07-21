import { describe, expect, it } from 'vitest'
import { applyAdaptiveAnswer, initialAdaptive } from './adaptiveLevel'

describe('adaptiveLevel', () => {
  it('bumps difficulty after three perfect answers', () => {
    let s = initialAdaptive(2)
    s = applyAdaptiveAnswer(s, 0)
    s = applyAdaptiveAnswer(s, 0)
    expect(s.level).toBe(2)
    s = applyAdaptiveAnswer(s, 0)
    expect(s.level).toBe(3)
    expect(s.bumpedUp).toBe(true)
  })

  it('eases difficulty after two heavy-help answers', () => {
    let s = initialAdaptive(3)
    s = applyAdaptiveAnswer(s, 2)
    expect(s.level).toBe(3)
    s = applyAdaptiveAnswer(s, 3)
    expect(s.level).toBe(2)
    expect(s.easedDown).toBe(true)
  })

  it('never leaves 1…MAX_LEVEL', () => {
    let low = initialAdaptive(1)
    low = applyAdaptiveAnswer(low, 3)
    low = applyAdaptiveAnswer(low, 3)
    expect(low.level).toBe(1)

    let high = initialAdaptive(5)
    high = applyAdaptiveAnswer(high, 0)
    high = applyAdaptiveAnswer(high, 0)
    high = applyAdaptiveAnswer(high, 0)
    expect(high.level).toBe(5)
  })
})
