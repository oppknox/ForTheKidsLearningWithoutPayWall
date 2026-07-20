import { describe, it, expect } from 'vitest'
import { initialRound, pick } from './hintMachine'

describe('hintMachine', () => {
  it('starts at tier 0, unsolved', () => {
    expect(initialRound()).toEqual({ hintTier: 0, wrongIds: [], solved: false })
  })

  it('escalates one tier per wrong pick and records the wrong id', () => {
    let rs = initialRound()
    rs = pick(rs, 'b', 'a')
    expect(rs).toEqual({ hintTier: 1, wrongIds: ['b'], solved: false })
    rs = pick(rs, 'c', 'a')
    expect(rs).toEqual({ hintTier: 2, wrongIds: ['b', 'c'], solved: false })
  })

  it('caps the tier at 3 and dedupes wrong ids', () => {
    let rs = initialRound()
    rs = pick(rs, 'b', 'a')
    rs = pick(rs, 'b', 'a')
    rs = pick(rs, 'b', 'a')
    rs = pick(rs, 'b', 'a')
    expect(rs.hintTier).toBe(3)
    expect(rs.wrongIds).toEqual(['b'])
    expect(rs.solved).toBe(false)
  })

  it('solves on the correct pick at any tier', () => {
    expect(pick(initialRound(), 'a', 'a').solved).toBe(true)
    let rs = initialRound()
    rs = pick(rs, 'b', 'a')
    rs = pick(rs, 'c', 'a')
    const solved = pick(rs, 'a', 'a')
    expect(solved.solved).toBe(true)
    expect(solved.hintTier).toBe(2)
  })

  it('ignores picks after solving', () => {
    let rs = pick(initialRound(), 'a', 'a')
    rs = pick(rs, 'b', 'a')
    expect(rs).toEqual({ hintTier: 0, wrongIds: [], solved: true })
  })
})
