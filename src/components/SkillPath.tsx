import { useNavigate } from 'react-router-dom'
import type { Profile, WorldId } from '../types'
import { pathStepsFor } from '../lib/skillPath'
import { playPop } from '../lib/sfx'
import { speak } from '../lib/speech'

export function SkillPath({ world, profile }: { world: WorldId; profile: Profile }) {
  const navigate = useNavigate()
  const steps = pathStepsFor(world, profile)
  if (steps.length === 0) return null

  const next = steps.find((s) => s.status === 'next')
  const doneCount = steps.filter((s) => s.status === 'done').length

  return (
    <section className="skill-path" aria-labelledby="skill-path-title">
      <div className="skill-path-head">
        <div>
          <p className="eyebrow">Treasure path</p>
          <h2 id="skill-path-title">Suggested adventure</h2>
          <p className="skill-path-lead">
            {doneCount === steps.length
              ? 'You explored every stop — play any game you like!'
              : next
                ? `Next up: ${next.game.title}. Nothing is locked — roam free anytime.`
                : 'Follow the path or pick any game below.'}
          </p>
        </div>
        <span className="skill-path-count">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ol className="skill-path-steps">
        {steps.map((step) => (
          <li key={step.game.id}>
            <button
              type="button"
              className={`path-step path-${step.status}`}
              onClick={() => {
                playPop()
                speak(step.game.title)
                navigate(`/game/${step.game.id}`)
              }}
            >
              <span className="path-marker" aria-hidden="true">
                {step.status === 'done' ? '✓' : step.status === 'next' ? '★' : step.index + 1}
              </span>
              <span className="path-emoji">{step.game.emoji}</span>
              <span className="path-title">{step.game.title}</span>
              {step.status === 'next' && <span className="path-next-label">Next</span>}
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
