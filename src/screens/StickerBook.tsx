import { Link } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { Mascot } from '../components/Mascot'
import { STICKER_POOL } from '../games/registry'

export function StickerBook() {
  const { activeProfile } = useAppState()
  if (!activeProfile) return null

  const owned = new Set(activeProfile.stickers)

  return (
    <main className="screen">
      <header className="play-header">
        <Link to="/play" className="header-chip">
          ⬅ Worlds
        </Link>
      </header>
      <h1 className="screen-title">{activeProfile.name}'s Sticker Book</h1>
      <p className="screen-subtitle">
        Level up in any game to earn a new sticker!
      </p>
      <div className="sticker-grid">
        {STICKER_POOL.map((s) => (
          <span key={s} className={`sticker ${owned.has(s) ? 'owned' : ''}`}>
            {owned.has(s) ? s : '?'}
          </span>
        ))}
      </div>
      <Mascot mood={owned.size > 0 ? 'happy' : 'idle'} size={100} />
    </main>
  )
}
