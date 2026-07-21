import { Link, useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'

const RELEASES: { date: string; title: string; items: string[] }[] = [
  {
    date: 'July 20, 2026',
    title: 'Smarter practice paths',
    items: [
      'Treasure Path on each world suggests a gentle learning order — nothing is locked.',
      'Games remember tricky letters and facts and bring them back until they feel easy.',
      'Difficulty can ease up or step up mid-session based on how play is going.',
      'Pip’s Sound Garden now covers the full A–Z of beginning sounds.',
    ],
  },
  {
    date: 'July 20, 2026',
    title: 'Daily missions + parent wins',
    items: [
      'Pip’s Daily Mission on the world map — five minutes of age-fit practice with a progress star.',
      'Session recap shows what your child just practiced and their next treasure goal.',
      'Grown-ups area now opens with a “Wins today” snapshot: answers, no-hint moments, level-ups, and weekly practice days.',
    ],
  },
  {
    date: 'July 20, 2026',
    title: 'Pick your voice + easy install',
    items: [
      'Grown-ups can now choose which reading voice Pip uses (per device) and preview it.',
      'Step-by-step instructions for installing the app on iPad, Android, and computers.',
    ],
  },
  {
    date: 'July 20, 2026',
    title: 'Install it like an app — and six new games!',
    items: [
      "Pip's Playground can be added to your home screen and works offline.",
      'New games: Shape Safari, Pip\'s Sound Garden, Pattern Parade, Clockwork Castle, Story Problem Theater, and Fraction Pizza Party.',
    ],
  },
  {
    date: 'July 20, 2026',
    title: 'Games that fit your kid',
    items: [
      "Each child's age now picks their recommended world, puts the best-fit games up front, and starts games at the right difficulty.",
      'Big-kid games stay open as "challenges" and younger games become "warm-ups" — nothing is ever locked.',
    ],
  },
  {
    date: 'July 20, 2026',
    title: 'Rhymes, frogs, and blast-offs',
    items: [
      'New games: Rhyme Time and Number Line Frog.',
      'Rocket Race rockets now actually blast off when you get it right. 🚀',
      'A sound on/off button kids can reach, and a friendlier reading voice.',
    ],
  },
  {
    date: 'July 20, 2026',
    title: 'Spelling and gardening',
    items: [
      'New games: Word Builder (spell what you see!) and Times Table Garden (watch the answers bloom).',
      'Now live at pipsplayground.com and freekidslearning.com.',
    ],
  },
  {
    date: 'July 19, 2026',
    title: "Pip's Playground opens!",
    items: [
      'Three worlds — Letter Land, Number Ocean, and Multiplication Mountain — with seven games.',
      'Player profiles with build-your-own avatars, stars, stickers, and level-ups.',
      'Gentle spoken hints that always end in success. No ads, no accounts, no paywall — ever.',
    ],
  },
]

export function WhatsNew() {
  const navigate = useNavigate()
  return (
    <main className="screen info-page">
      <h1 className="screen-title">What's new</h1>
      <section className="info-card">
        {RELEASES.map((r, i) => (
          <div key={i} className="release">
            <h2>{r.title}</h2>
            <p className="info-date">{r.date}</p>
            <ul>
              {r.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <p>
          Got an idea for a game? <Link to="/feedback">Tell us!</Link>
        </p>
      </section>
      <BigButton color="var(--ocean)" onClick={() => navigate('/')}>
        Back
      </BigButton>
    </main>
  )
}
