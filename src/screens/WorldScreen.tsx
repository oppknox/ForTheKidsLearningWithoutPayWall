import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { WORLDS, gamesForWorld } from '../games/registry'
import { MAX_LEVEL } from '../lib/progress'
import type { WorldId } from '../types'
import { playPop } from '../lib/sfx'
import { speak } from '../lib/speech'

export function WorldScreen() {
  const { worldId } = useParams()
  const { activeProfile } = useAppState()
  const navigate = useNavigate()

  if (!activeProfile || !worldId || !(worldId in WORLDS)) return null
  const wid = worldId as WorldId
  const world = WORLDS[wid]
  const games = gamesForWorld(wid)

  return (
    <main className="screen">
      <header className="play-header">
        <Link to="/play" className="header-chip">
          ⬅ Worlds
        </Link>
        <span className="header-chip">⭐ {activeProfile.stars}</span>
      </header>

      <h1 className="screen-title">
        {world.emoji} {world.title}
      </h1>

      <div className="game-grid">
        {games.map((g) => {
          const level = activeProfile.progress[g.id]?.level ?? 1
          return (
            <button
              key={g.id}
              className="game-card"
              onClick={() => {
                playPop()
                speak(g.title)
                navigate(`/game/${g.id}`)
              }}
            >
              <span className="game-emoji">{g.emoji}</span>
              <span className="game-title">{g.title}</span>
              <span className="game-level">
                {'⭐'.repeat(level)}
                {'☆'.repeat(MAX_LEVEL - level)}
              </span>
              <span className="game-ages">Ages {g.ages}</span>
            </button>
          )
        })}
      </div>
    </main>
  )
}
