import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { AvatarSVG } from '../components/AvatarSVG'
import { BigButton } from '../components/BigButton'
import { randInt } from '../lib/rng'
import { InstallApp } from '../components/InstallApp'
import { VoicePicker } from '../components/VoicePicker'
import { SiteFooter } from '../components/SiteFooter'

const GATE_KEY = 'ftk-gate-ok'
const GATE_TTL_MS = 10 * 60 * 1000

function gateRecentlyPassed(): boolean {
  try {
    const at = Number(sessionStorage.getItem(GATE_KEY))
    return Boolean(at) && Date.now() - at < GATE_TTL_MS
  } catch {
    return false
  }
}

function rememberGatePass(): void {
  try {
    sessionStorage.setItem(GATE_KEY, String(Date.now()))
  } catch {
    /* private mode — gate will just re-ask */
  }
}

/** Grown-ups area: a typed multiplication gate, then profile management.
 * A pass sticks for 10 minutes so saving a profile doesn't re-ask. */
export function ParentGate() {
  const [passed, setPassed] = useState(gateRecentlyPassed)
  return passed ? (
    <GrownUps />
  ) : (
    <Gate
      onPass={() => {
        rememberGatePass()
        setPassed(true)
      }}
    />
  )
}

function Gate({ onPass }: { onPass: () => void }) {
  const navigate = useNavigate()
  const [a, b] = useMemo(() => [randInt(11, 19), randInt(3, 9)], [])
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (Number(answer.trim()) === a * b) onPass()
    else {
      setWrong(true)
      setAnswer('')
    }
  }

  return (
    <main className="screen">
      <h1 className="screen-title">Grown-ups only</h1>
      <p className="screen-subtitle">
        To keep little fingers out, type the answer: <strong>{a} × {b}</strong>
      </p>
      <form className="gate-form" onSubmit={submit}>
        <input
          className="gate-input"
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          aria-label={`What is ${a} times ${b}?`}
          autoFocus
        />
        <BigButton type="submit">Unlock</BigButton>
      </form>
      {wrong && <p className="screen-subtitle">Not quite — try again.</p>}
      <BigButton color="var(--ocean)" onClick={() => navigate('/')}>
        Back
      </BigButton>
    </main>
  )
}

function GrownUps() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  return (
    <main className="screen">
      <h1 className="screen-title">Players</h1>
      <div className="manage-list">
        {state.profiles.map((p) => (
          <div key={p.id} className="manage-row">
            <AvatarSVG config={p.avatar} size={64} />
            <div className="manage-info">
              <strong>{p.name}</strong>
              <span>
                Age {p.age} · ⭐ {p.stars} · {p.stickers.length} stickers
              </span>
            </div>
            <Link to={`/grown-ups/edit/${p.id}`} className="manage-edit">
              Edit
            </Link>
            <button
              className="manage-delete"
              onClick={() => {
                if (confirm(`Delete ${p.name}'s player and all their progress?`))
                  dispatch({ type: 'deleteProfile', id: p.id })
              }}
            >
              Delete
            </button>
          </div>
        ))}
        {state.profiles.length === 0 && (
          <p className="screen-subtitle">No players yet — add your first!</p>
        )}
      </div>
      <BigButton onClick={() => navigate('/grown-ups/edit')}>+ Add a player</BigButton>
      <BigButton color="var(--ocean)" onClick={() => navigate('/')}>
        Done
      </BigButton>
      <label className="mute-row">
        <input
          type="checkbox"
          checked={state.muted}
          onChange={(e) => dispatch({ type: 'setMuted', muted: e.target.checked })}
        />
        Mute all sound and voices
      </label>
      <VoicePicker />
      <InstallApp />
      <SiteFooter />
    </main>
  )
}
