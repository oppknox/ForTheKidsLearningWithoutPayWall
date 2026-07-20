import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { WORLDS, gamesForWorld } from '../games/registry'
import { MAX_LEVEL } from '../lib/progress'
import { ageFit, parseAges, startingLevel, type AgeFit } from '../lib/ageFit'
import type { WorldId } from '../types'
import { playPop } from '../lib/sfx'
import { speak } from '../lib/speech'
import { SoundToggle } from '../components/SoundToggle'

const FIT_LABEL: Record<AgeFit, string | null> = {
  fit: null,
  stretch: '💪 Big kid challenge',
  warmup: '⚡ Quick warm-up',
}

const FIT_ORDER: Record<AgeFit, number> = { fit: 0, warmup: 1, stretch: 2 }

export function WorldScreen() {
  const { worldId } = useParams()
  const { activeProfile } = useAppState()
  const navigate = useNavigate()

  if (!activeProfile || !worldId || !(worldId in WORLDS)) return null
  const wid = worldId as WorldId
  const world = WORLDS[wid]
  const age = activeProfile.age

  // Age-fitting games lead; warm-ups and stretch games follow, smaller but open.
  const games = [...gamesForWorld(wid)].sort(
    (a, b) => FIT_ORDER[ageFit(age, parseAges(a.ages))] - FIT_ORDER[ageFit(age, parseAges(b.ages))],
  )
  const firstUnplayedFit = games.find(
    (g) => ageFit(age, parseAges(g.ages)) === 'fit' && !activeProfile.progress[g.id]?.totalCorrect,
  )

  return (
    <main className="screen">
      <header className="play-header">
        <Link to="/play" className="header-chip">
          ⬅ Worlds
        </Link>
        <span className="header-chip">⭐ {activeProfile.stars}</span>
        <SoundToggle />
      </header>

      <h1 className="screen-title">
        {world.emoji} {world.title}
      </h1>

      <div className="game-grid">
        {games.map((g) => {
          const range = parseAges(g.ages)
          const fit = ageFit(age, range)
          const level =
            activeProfile.progress[g.id]?.level ?? startingLevel(age, range)
          return (
            <button
              key={g.id}
              className={`game-card ${fit !== 'fit' ? 'game-side' : ''}`}
              onClick={() => {
                playPop()
                speak(g.title)
                navigate(`/game/${g.id}`)
              }}
            >
              {g === firstUnplayedFit && <span className="recommend-badge">Start here</span>}
              {FIT_LABEL[fit] && <span className="fit-badge">{FIT_LABEL[fit]}</span>}
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
