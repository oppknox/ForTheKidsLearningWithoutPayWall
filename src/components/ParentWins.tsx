import { useAppState } from '../state/ProfilesContext'
import { AvatarSVG } from './AvatarSVG'
import { winsForAll } from '../lib/parentInsights'
import { stillGrowingLabels } from '../lib/itemMastery'

export function ParentWins() {
  const { state } = useAppState()
  if (state.profiles.length === 0) return null

  const wins = winsForAll(state.profiles)

  return (
    <section className="parent-wins" aria-labelledby="wins-title">
      <h2 id="wins-title">Wins today</h2>
      <p className="parent-wins-lead">What they practiced — open anytime after play.</p>
      <div className="wins-list">
        {wins.map((w) => {
          const growing = stillGrowingLabels(w.profile)
          return (
            <article className="wins-card" key={w.profile.id}>
              <header className="wins-card-head">
                <AvatarSVG config={w.profile.avatar} size={56} />
                <div>
                  <strong>{w.profile.name}</strong>
                  <span className="wins-age">Age {w.profile.age}</span>
                </div>
              </header>
              <p className="wins-proud">{w.proudLine}</p>
              <ul className="wins-stats">
                <li>
                  <strong>{w.today.correct}</strong> answers today
                  {w.today.perfect > 0 ? ` · ${w.today.perfect} with no hints` : ''}
                </li>
                <li>
                  <strong>{w.weekDays}</strong> practice day{w.weekDays === 1 ? '' : 's'} this week
                  {w.weekCorrect > 0 ? ` · ${w.weekCorrect} answers` : ''}
                </li>
                {w.levelUpTitles.length > 0 && (
                  <li>🚀 Leveled up: {w.levelUpTitles.join(', ')}</li>
                )}
                {w.today.highlights.length > 0 && (
                  <li>Practiced: {w.today.highlights.slice(-6).join(' · ')}</li>
                )}
                {growing.length > 0 && <li>Still growing: {growing.join(' · ')}</li>}
                {w.nextGoalTitle && <li>Next goal: {w.nextGoalTitle}</li>}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
