import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { Mascot } from '../components/Mascot'
import { Confetti } from '../components/Confetti'

const KINDS = [
  { id: 'game-idea', label: '🎮 Request a game' },
  { id: 'feedback', label: '💬 Share feedback' },
  { id: 'bug', label: '🐛 Report a problem' },
] as const

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Feedback() {
  const navigate = useNavigate()
  const [kind, setKind] = useState<(typeof KINDS)[number]['id']>('game-idea')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [website, setWebsite] = useState('') // honeypot — humans never see it
  const [status, setStatus] = useState<Status>('idle')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, message, contact, website }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <main className="screen info-page">
        <Confetti burst={1} />
        <Mascot mood="celebrate" size={130} />
        <h1 className="screen-title">Thank you!</h1>
        <p className="screen-subtitle">
          Pip delivered your note. We read every single one.
        </p>
        <BigButton color="var(--ocean)" onClick={() => navigate('/')}>
          Back to the playground
        </BigButton>
      </main>
    )
  }

  return (
    <main className="screen info-page">
      <Mascot mood="happy" size={100} />
      <h1 className="screen-title">Tell us anything!</h1>
      <form className="info-card feedback-form" onSubmit={submit}>
        <div className="kind-row" role="radiogroup" aria-label="What kind of note is this?">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              role="radio"
              aria-checked={kind === k.id}
              className={`swatch kind-swatch ${kind === k.id ? 'selected' : ''}`}
              onClick={() => setKind(k.id)}
            >
              {k.label}
            </button>
          ))}
        </div>

        <label htmlFor="feedback-message">
          {kind === 'game-idea'
            ? 'What game should Pip build next?'
            : kind === 'bug'
              ? 'What went wrong? (Which game, and what happened?)'
              : "What's on your mind?"}
        </label>
        <textarea
          id="feedback-message"
          className="feedback-text"
          maxLength={2000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A dinosaur counting game where…"
        />

        <label htmlFor="feedback-contact">
          Email for a reply <em>(optional — leave blank to stay anonymous)</em>
        </label>
        <input
          id="feedback-contact"
          className="gate-input feedback-contact"
          type="email"
          maxLength={200}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="you@example.com"
        />

        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hp-field"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {status === 'error' && (
          <p className="feedback-error">
            Hmm, that didn't send. Check your connection and try again?
          </p>
        )}

        <div className="editor-actions">
          <BigButton type="submit" disabled={!message.trim() || status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send to Pip 📨'}
          </BigButton>
          <BigButton type="button" color="var(--ocean)" onClick={() => navigate('/')}>
            Cancel
          </BigButton>
        </div>
      </form>
    </main>
  )
}
