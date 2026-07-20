import { describe, it, expect } from 'vitest'
import { validateFeedback, MESSAGE_MAX } from '../../worker/validateFeedback'

describe('validateFeedback', () => {
  it('accepts a clean submission and trims fields', () => {
    expect(
      validateFeedback({ kind: 'game-idea', message: '  A dinosaur counting game!  ', contact: ' me@example.com ' }),
    ).toEqual({ kind: 'game-idea', message: 'A dinosaur counting game!', contact: 'me@example.com' })
  })

  it('treats missing/empty contact as null', () => {
    expect(validateFeedback({ kind: 'bug', message: 'The frog hopped backwards' })?.contact).toBeNull()
    expect(validateFeedback({ kind: 'bug', message: 'x', contact: '   ' })?.contact).toBeNull()
  })

  it('rejects unknown kinds, empty and oversize messages, and non-objects', () => {
    expect(validateFeedback({ kind: 'spam', message: 'hi' })).toBeNull()
    expect(validateFeedback({ kind: 'bug', message: '   ' })).toBeNull()
    expect(validateFeedback({ kind: 'bug', message: 'x'.repeat(MESSAGE_MAX + 1) })).toBeNull()
    expect(validateFeedback('nope')).toBeNull()
    expect(validateFeedback(null)).toBeNull()
  })

  it('rejects submissions that fill the honeypot', () => {
    expect(validateFeedback({ kind: 'feedback', message: 'legit', website: 'http://spam' })).toBeNull()
  })
})
