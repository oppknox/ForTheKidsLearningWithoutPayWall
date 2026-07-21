import { BigButton } from './BigButton'
import { Confetti } from './Confetti'
import { Mascot } from './Mascot'
import { StarCount } from './StarCount'
import { nextGoalFor, type Achievement } from '../lib/achievements'
import type { Profile } from '../types'

interface SessionRecapProps {
  name: string
  sessionStars: number
  highlights: string[]
  leveledUp?: boolean
  sticker?: string | null
  /** Prefer passing profile so next goal stays current after the session. */
  profile?: Profile
  nextGoal?: Achievement | null
  missionJustCompleted?: boolean
  burst?: number
  playAgainLabel?: string
  moreGamesLabel?: string
  onPlayAgain: () => void
  onMoreGames: () => void
}

export function SessionRecap({
  name,
  sessionStars,
  highlights,
  leveledUp,
  sticker,
  profile,
  nextGoal: nextGoalProp,
  missionJustCompleted,
  burst = 1,
  playAgainLabel = 'Play again!',
  moreGamesLabel = 'More games',
  onPlayAgain,
  onMoreGames,
}: SessionRecapProps) {
  const shown = highlights.slice(-8)
  const nextGoal = nextGoalProp ?? (profile ? nextGoalFor(profile) : null)
  return (
    <main className="screen session-recap">
      <Confetti burst={burst} />
      <Mascot mood="celebrate" size={140} />
      <h1 className="screen-title">Hooray, {name}!</h1>
      <StarCount stars={sessionStars} />

      {shown.length > 0 && (
        <section className="recap-card" aria-label="What you practiced">
          <h2>You practiced</h2>
          <ul className="recap-highlights">
            {shown.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      )}

      {leveledUp && (
        <p className="recap-boost">
          🎉 Level up!{sticker ? ` New sticker: ${sticker}` : ' You are unstoppable!'}
        </p>
      )}

      {missionJustCompleted && (
        <p className="recap-mission">🌟 Daily mission complete! Pip is so proud.</p>
      )}

      {nextGoal && !nextGoal.earned && (
        <div className="next-goal recap-goal">
          <span className="goal-emoji">{nextGoal.emoji}</span>
          <div>
            <strong>Next treasure: {nextGoal.title}</strong>
            <br />
            {nextGoal.description}
          </div>
          <span>
            {nextGoal.progress}/{nextGoal.target}
          </span>
        </div>
      )}

      <p className="recap-teaser">Pip will have a new treasure mission tomorrow! ✨</p>

      <div className="editor-actions">
        <BigButton onClick={onPlayAgain}>{playAgainLabel}</BigButton>
        <BigButton color="var(--ocean)" onClick={onMoreGames}>
          {moreGamesLabel}
        </BigButton>
      </div>
    </main>
  )
}
