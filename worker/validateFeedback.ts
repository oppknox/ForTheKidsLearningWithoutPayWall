export const FEEDBACK_KINDS = ['game-idea', 'feedback', 'bug'] as const
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]

export interface FeedbackSubmission {
  kind: FeedbackKind
  message: string
  contact: string | null
}

export const MESSAGE_MAX = 2000
export const CONTACT_MAX = 200

/**
 * Validate a raw feedback body. Returns the cleaned submission or null.
 * `website` is a honeypot field — humans never see it, bots fill it.
 */
export function validateFeedback(raw: unknown): FeedbackSubmission | null {
  if (typeof raw !== 'object' || raw === null) return null
  const body = raw as Record<string, unknown>

  if (typeof body.website === 'string' && body.website.length > 0) return null

  if (!FEEDBACK_KINDS.includes(body.kind as FeedbackKind)) return null

  if (typeof body.message !== 'string') return null
  const message = body.message.trim()
  if (message.length === 0 || message.length > MESSAGE_MAX) return null

  let contact: string | null = null
  if (typeof body.contact === 'string' && body.contact.trim().length > 0) {
    contact = body.contact.trim()
    if (contact.length > CONTACT_MAX) return null
  }

  return { kind: body.kind as FeedbackKind, message, contact }
}
