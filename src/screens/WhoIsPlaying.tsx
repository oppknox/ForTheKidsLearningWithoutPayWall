import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { AvatarSVG } from '../components/AvatarSVG'
import { Mascot } from '../components/Mascot'
import { BigButton } from '../components/BigButton'
import { speak } from '../lib/speech'
import { playPop } from '../lib/sfx'

export function WhoIsPlaying() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  const pick = (id: string, name: string) => {
    playPop()
    dispatch({ type: 'selectProfile', id })
    speak(`Hi ${name}! Let's play!`)
    navigate('/play')
  }

  return (
    <main className="screen">
      <Mascot mood="happy" size={110} />
      <h1 className="screen-title">Who's playing today?</h1>
      {state.profiles.length === 0 && (
        <p className="screen-subtitle">
          Welcome! A grown-up can set up your player in ten seconds.
        </p>
      )}
      <div className="avatar-grid">
        {state.profiles.map((p) => (
          <button
            key={p.id}
            className="avatar-card"
            onClick={() => pick(p.id, p.name)}
          >
            <AvatarSVG config={p.avatar} size={110} />
            <span className="avatar-name">{p.name}</span>
            <span className="avatar-stars">⭐ {p.stars}</span>
          </button>
        ))}
      </div>
      <BigButton color="var(--leaf)" onClick={() => navigate('/grown-ups')}>
        {state.profiles.length === 0 ? 'Grown-ups: create a player' : 'Grown-ups'}
      </BigButton>
    </main>
  )
}
