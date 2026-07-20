import { useNavigate, Link } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { AvatarSVG } from '../components/AvatarSVG'
import { Mascot } from '../components/Mascot'
import { WORLDS } from '../games/registry'
import type { WorldId } from '../types'
import { playPop } from '../lib/sfx'
import { speak } from '../lib/speech'

const WORLD_COLORS: Record<WorldId, string> = {
  letters: 'linear-gradient(135deg, #ffb86b, #ff7b54)',
  numbers: 'linear-gradient(135deg, #6fd3ff, #2aa7de)',
  multiplication: 'linear-gradient(135deg, #b39ce8, #8e6fd8)',
}

export function WorldMap() {
  const { activeProfile } = useAppState()
  const navigate = useNavigate()

  if (!activeProfile) return null // router redirects; belt-and-suspenders

  const worldIds = Object.keys(WORLDS) as WorldId[]

  return (
    <main className="screen">
      <header className="play-header">
        <Link to="/" className="header-chip" aria-label="Switch player">
          <AvatarSVG config={activeProfile.avatar} size={44} />
          <span>{activeProfile.name}</span>
        </Link>
        <span className="header-chip">⭐ {activeProfile.stars}</span>
        <Link to="/stickers" className="header-chip">
          📖 Stickers
        </Link>
      </header>

      <h1 className="screen-title">Pick a world!</h1>

      <div className="world-grid">
        {worldIds.map((id) => (
          <button
            key={id}
            className="world-card"
            style={{ background: WORLD_COLORS[id] }}
            onClick={() => {
              playPop()
              speak(WORLDS[id].title)
              navigate(`/world/${id}`)
            }}
          >
            <span className="world-emoji">{WORLDS[id].emoji}</span>
            <span className="world-title">{WORLDS[id].title}</span>
            <span className="world-tagline">{WORLDS[id].tagline}</span>
          </button>
        ))}
      </div>

      <Mascot mood="idle" size={100} />
    </main>
  )
}
