import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { AvatarSVG } from '../components/AvatarSVG'
import { BigButton } from '../components/BigButton'
import type { Accessory, AvatarConfig, Creature } from '../types'

const CREATURES: { id: Creature; label: string }[] = [
  { id: 'fox', label: 'Fox' },
  { id: 'frog', label: 'Frog' },
  { id: 'robot', label: 'Robot' },
  { id: 'cat', label: 'Cat' },
  { id: 'panda', label: 'Panda' },
  { id: 'dino', label: 'Dino' },
]

const COLORS = ['#f4813f', '#5cc46a', '#2aa7de', '#8e6fd8', '#ff5f9e', '#ffc93c', '#9aa4b2']
const COLOR_NAMES: Record<string, string> = {
  '#f4813f': 'Orange', '#5cc46a': 'Green', '#2aa7de': 'Blue', '#8e6fd8': 'Purple',
  '#ff5f9e': 'Pink', '#ffc93c': 'Yellow', '#9aa4b2': 'Gray',
}

const ACCESSORIES: { id: Accessory; label: string }[] = [
  { id: 'none', label: 'Nothing' },
  { id: 'bow', label: 'Bow' },
  { id: 'cap', label: 'Cap' },
  { id: 'glasses', label: 'Glasses' },
  { id: 'crown', label: 'Crown' },
]

export function ProfileEditor() {
  const { id } = useParams()
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const existing = state.profiles.find((p) => p.id === id)

  const [name, setName] = useState(existing?.name ?? '')
  const [age, setAge] = useState(existing?.age ?? 5)
  const [avatar, setAvatar] = useState<AvatarConfig>(
    existing?.avatar ?? { creature: 'fox', color: '#f4813f', accessory: 'none' },
  )

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (existing) {
      dispatch({ type: 'updateProfile', id: existing.id, patch: { name: trimmed, age, avatar } })
    } else {
      dispatch({ type: 'addProfile', name: trimmed, age, avatar })
    }
    navigate('/grown-ups')
  }

  return (
    <main className="screen">
      <h1 className="screen-title">{existing ? `Edit ${existing.name}` : 'New player'}</h1>
      <div className="editor-preview">
        <AvatarSVG config={avatar} size={130} />
      </div>

      <input
        className="gate-input name-input"
        placeholder="Name"
        value={name}
        maxLength={20}
        onChange={(e) => setName(e.target.value)}
        aria-label="Child's name"
      />

      <section className="editor-section">
        <h2 className="editor-label">Age</h2>
        <div className="swatch-row">
          {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              className={`swatch age-swatch ${age === n ? 'selected' : ''}`}
              onClick={() => setAge(n)}
              aria-pressed={age === n}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="editor-section">
        <h2 className="editor-label">Creature</h2>
        <div className="swatch-row">
          {CREATURES.map((c) => (
            <button
              key={c.id}
              className={`swatch creature-swatch ${avatar.creature === c.id ? 'selected' : ''}`}
              onClick={() => setAvatar({ ...avatar, creature: c.id })}
              aria-label={c.label}
              aria-pressed={avatar.creature === c.id}
            >
              <AvatarSVG config={{ ...avatar, creature: c.id }} size={56} />
            </button>
          ))}
        </div>
      </section>

      <section className="editor-section">
        <h2 className="editor-label">Color</h2>
        <div className="swatch-row">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`swatch color-swatch ${avatar.color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setAvatar({ ...avatar, color: c })}
              aria-label={COLOR_NAMES[c]}
              aria-pressed={avatar.color === c}
            />
          ))}
        </div>
      </section>

      <section className="editor-section">
        <h2 className="editor-label">Accessory</h2>
        <div className="swatch-row">
          {ACCESSORIES.map((a) => (
            <button
              key={a.id}
              className={`swatch creature-swatch ${avatar.accessory === a.id ? 'selected' : ''}`}
              onClick={() => setAvatar({ ...avatar, accessory: a.id })}
              aria-label={a.label}
              aria-pressed={avatar.accessory === a.id}
            >
              {a.id === 'none' ? (
                <span className="swatch-text">—</span>
              ) : (
                <AvatarSVG config={{ ...avatar, accessory: a.id }} size={56} />
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="editor-actions">
        <BigButton onClick={save} disabled={!name.trim()}>
          Save
        </BigButton>
        <BigButton color="var(--ocean)" onClick={() => navigate('/grown-ups')}>
          Cancel
        </BigButton>
      </div>
    </main>
  )
}
