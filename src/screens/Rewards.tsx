import { Link } from 'react-router-dom'
import { useAppState } from '../state/ProfilesContext'
import { achievementsFor, collectionProgress, nextGoalFor } from '../lib/achievements'
import { WORLDS } from '../games/registry'
import type { WorldId } from '../types'
import { playPop } from '../lib/sfx'

const COLLECTIONS: Record<WorldId, { name: string; prizes: string[] }> = {
  letters: { name: 'Balloon Patches', prizes: ['🎈', '🦜', '🌈'] },
  numbers: { name: 'Ocean Friends', prizes: ['🐠', '🐢', '🐬'] },
  multiplication: { name: 'Mountain Medals', prizes: ['🥾', '🦅', '🏔️'] },
}

const REWARDS = [
  { id: 'sunset', emoji: '🌅', name: 'Sunset Trail', cost: 30 },
  { id: 'sparkle', emoji: '✨', name: 'Sparkle Trail', cost: 60 },
  { id: 'royal', emoji: '👑', name: 'Royal Trail', cost: 100 },
]

export function Rewards() {
  const { activeProfile, dispatch } = useAppState()
  if (!activeProfile) return null
  const achievements = achievementsFor(activeProfile)
  const goal = nextGoalFor(activeProfile)
  const unlocked = new Set(activeProfile.unlockedRewards ?? [])
  const trailTheme = ['royal', 'sparkle', 'sunset'].find((id) => unlocked.has(id)) ?? 'classic'
  const worldIds = Object.keys(WORLDS) as WorldId[]

  return (
    <main className={`screen rewards-screen trail-${trailTheme}`}>
      <header className="play-header">
        <Link to="/play" className="header-chip">⬅ Worlds</Link>
        <span className="header-chip">⭐ {activeProfile.stars}</span>
        <Link to="/stickers" className="header-chip">📖 Stickers</Link>
      </header>

      <section className="treasure-hero">
        <div>
          <p className="eyebrow">{activeProfile.name}'s Treasure Trail</p>
          <h1>Every little step grows your adventure!</h1>
          {goal ? (
            <div className="next-goal">
              <span className="goal-emoji">{goal.emoji}</span>
              <div><strong>Next treasure: {goal.title}</strong><br />{goal.description}</div>
              <span>{goal.progress}/{goal.target}</span>
            </div>
          ) : <p className="next-goal">👑 You found every achievement!</p>}
        </div>
      </section>

      <section className="reward-section">
        <h2>🗺️ World Collections</h2>
        <div className="collection-grid">
          {worldIds.map((world) => {
            const progress = collectionProgress(activeProfile, world)
            return <article className={`collection-card ${world}`} key={world}>
              <h3>{WORLDS[world].emoji} {COLLECTIONS[world].name}</h3>
              <p>{progress.correct} answers in {WORLDS[world].title}</p>
              <div className="collection-prizes">
                {COLLECTIONS[world].prizes.map((prize, i) => (
                  <span key={prize} className={progress.earned > i ? 'earned' : ''} title={`${progress.milestones[i]} answers`}>
                    {progress.earned > i ? prize : '🔒'}
                    <small>{progress.milestones[i]}</small>
                  </span>
                ))}
              </div>
            </article>
          })}
        </div>
      </section>

      <section className="reward-section">
        <h2>🏅 Achievement Badges</h2>
        <div className="achievement-grid">
          {achievements.map((a) => <article className={`achievement-card ${a.earned ? 'earned' : ''}`} key={a.id}>
            <span className="achievement-emoji">{a.earned ? a.emoji : '❔'}</span>
            <div><h3>{a.title}</h3><p>{a.description}</p></div>
            <strong>{a.earned ? 'Earned!' : `${a.progress}/${a.target}`}</strong>
          </article>)}
        </div>
      </section>

      <section className="reward-section star-shop">
        <h2>⭐ Treasure Shop</h2>
        <p>Stars unlock permanent decorations. Learning games always stay open.</p>
        <div className="shop-grid">
          {REWARDS.map((reward) => {
            const owned = unlocked.has(reward.id)
            return <button key={reward.id} disabled={owned || activeProfile.stars < reward.cost}
              onClick={() => { playPop(); dispatch({ type: 'unlockReward', rewardId: reward.id, cost: reward.cost }) }}>
              <span>{reward.emoji}</span><strong>{reward.name}</strong>
              <small>{owned ? 'Owned forever!' : `⭐ ${reward.cost}`}</small>
            </button>
          })}
        </div>
      </section>
    </main>
  )
}
