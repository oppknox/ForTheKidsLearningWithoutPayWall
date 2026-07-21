import { useNavigate } from 'react-router-dom'
import type { Profile } from '../types'
import { missionStatus, welcomeBackMessage } from '../lib/dailyMission'
import { playPop } from '../lib/sfx'
import { speak } from '../lib/speech'

export function DailyMissionCard({ profile }: { profile: Profile }) {
  const navigate = useNavigate()
  const mission = missionStatus(profile)
  const welcome = welcomeBackMessage(profile)
  const { game, correct, target, complete } = mission

  return (
    <section className={`mission-card ${complete ? 'mission-done' : ''}`} aria-labelledby="mission-title">
      {welcome && <p className="mission-welcome">{welcome}</p>}
      <div className="mission-body">
        <div className="mission-copy">
          <p className="eyebrow">Pip’s Daily Mission</p>
          <h2 id="mission-title">
            {complete ? 'Mission complete!' : `Play ${game.title}`}
          </h2>
          <p>
            {complete
              ? 'You earned today’s mission star. Come back tomorrow for a new treasure!'
              : `${target} answers in ${game.title} — about five minutes of fun.`}
          </p>
          <div
            className="mission-progress"
            role="progressbar"
            aria-valuenow={complete ? target : correct}
            aria-valuemin={0}
            aria-valuemax={target}
            aria-label={`Mission progress ${complete ? target : correct} of ${target}`}
          >
            <span
              className="mission-progress-fill"
              style={{ width: `${((complete ? target : correct) / target) * 100}%` }}
            />
          </div>
          <span className="mission-count">
            {complete ? `🌟 ${target}/${target}` : `${correct}/${target}`}
          </span>
        </div>
        <button
          className="mission-go"
          onClick={() => {
            playPop()
            speak(complete ? `${game.title} again!` : `Mission: ${game.title}!`)
            navigate(`/game/${game.id}`)
          }}
        >
          <span className="mission-emoji">{complete ? '🌟' : game.emoji}</span>
          <span>{complete ? 'Play again' : 'Start mission'}</span>
        </button>
      </div>
    </section>
  )
}
