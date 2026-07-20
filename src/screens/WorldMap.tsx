import { useNavigate, Link } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { AvatarSVG } from '../components/AvatarSVG'
import { Mascot } from '../components/Mascot'
import { WORLDS } from '../games/registry'
import type { WorldId } from '../types'
import { playPop } from '../lib/sfx'
import { speak } from '../lib/speech'
import { SoundToggle } from '../components/SoundToggle'

const WORLD_COLORS: Record<WorldId, string> = {
  letters: 'linear-gradient(135deg, #ffb86b, #ff7b54)',
  numbers: 'linear-gradient(135deg, #6fd3ff, #2aa7de)',
  multiplication: 'linear-gradient(135deg, #b39ce8, #8e6fd8)',
}

function recommendedWorld(age: number): WorldId {
  if (age <= 5) return 'letters'
  if (age <= 7) return 'numbers'
  return 'multiplication'
}

export function WorldMap() {
  const { activeProfile } = useAppState()
  const navigate = useNavigate()

  if (!activeProfile) return null // router redirects; belt-and-suspenders

  // Recommended world leads; the rest keep their canonical order.
  const recommended = recommendedWorld(activeProfile.age)
  const worldIds = (Object.keys(WORLDS) as WorldId[]).sort(
    (a, b) => Number(b === recommended) - Number(a === recommended),
  )

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
        <SoundToggle />
      </header>

      <h1 className="screen-title">Where should we play?</h1>

      <p className="screen-subtitle">
        We recommend a starting place for age {activeProfile.age}, but every world is open.
      </p>

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
            {id === recommended && (
              <span className="recommend-badge">Great place to start!</span>
            )}
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
