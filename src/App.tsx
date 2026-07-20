import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppStateProvider, useAppState } from './state/ProfilesContext'
import { WhoIsPlaying } from './screens/WhoIsPlaying'
import { ParentGate } from './screens/ParentGate'
import { ProfileEditor } from './screens/ProfileEditor'
import { Privacy } from './screens/Privacy'
import { Feedback } from './screens/Feedback'
import { WhatsNew } from './screens/WhatsNew'
import { WorldMap } from './screens/WorldMap'
import { WorldScreen } from './screens/WorldScreen'
import { StickerBook } from './screens/StickerBook'
import { gameById } from './games/registry'
import { GameShell } from './games/GameShell'

function Clouds() {
  const clouds = [
    { top: '8%', duration: 70, delay: -20, scale: 1 },
    { top: '22%', duration: 95, delay: -60, scale: 0.7 },
    { top: '55%', duration: 110, delay: -35, scale: 0.5 },
  ]
  return (
    <div className="cloud-layer" aria-hidden="true">
      {clouds.map((c, i) => (
        <span
          key={i}
          className="cloud"
          style={{
            top: c.top,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            transform: `scale(${c.scale})`,
          }}
        />
      ))}
    </div>
  )
}

/** Sky gradient follows the world the kid is in. */
function Sky() {
  const { pathname } = useLocation()
  let theme = ''
  const worldMatch = pathname.match(/^\/world\/(\w+)/)
  const gameMatch = pathname.match(/^\/game\/([\w-]+)/)
  if (worldMatch) theme = worldMatch[1]
  else if (gameMatch) theme = gameById(gameMatch[1])?.world ?? ''
  return <div className={`sky ${theme}`} />
}

/** Routes that need a selected kid; otherwise back to "Who's playing?". */
function RequireKid({ children }: { children: ReactNode }) {
  const { activeProfile } = useAppState()
  if (!activeProfile) return <Navigate to="/" replace />
  return <>{children}</>
}

function GameRoute() {
  const { gameId } = useParams()
  const game = gameId ? gameById(gameId) : undefined
  if (!game) return <Navigate to="/play" replace />
  if (game.FreePlay) return <game.FreePlay />
  return <GameShell key={game.id} game={game} />
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sky />
          <Clouds />
          <Routes>
            <Route path="/" element={<WhoIsPlaying />} />
            <Route path="/grown-ups" element={<ParentGate />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/whats-new" element={<WhatsNew />} />
            <Route path="/grown-ups/edit/:id?" element={<ProfileEditor />} />
            <Route path="/play" element={<RequireKid><WorldMap /></RequireKid>} />
            <Route path="/world/:worldId" element={<RequireKid><WorldScreen /></RequireKid>} />
            <Route path="/stickers" element={<RequireKid><StickerBook /></RequireKid>} />
            <Route path="/game/:gameId" element={<RequireKid><GameRoute /></RequireKid>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppStateProvider>
  )
}
