import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GameDef, Round } from '../types'
import { ALPHABET } from './letterData'
import { useAppState } from '../../state/ProfilesContext'
import { STICKER_POOL } from '../registry'
import { Mascot } from '../../components/Mascot'
import { Confetti } from '../../components/Confetti'
import { BigButton } from '../../components/BigButton'
import { speak } from '../../lib/speech'
import { playPop, playFanfare } from '../../lib/sfx'

function FreePlay() {
  const { dispatch } = useAppState()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const entry = ALPHABET[index]

  useEffect(() => {
    if (!finished) speak(`${entry.letter}! ${entry.letter} is for ${entry.word}!`)
  }, [entry, finished])

  const next = () => {
    playPop()
    if (index === ALPHABET.length - 1) {
      playFanfare()
      speak('You did the whole alphabet! Hooray!')
      dispatch({
        type: 'recordCorrect',
        gameId: 'alphabetParade',
        hintsUsed: 0,
        stickerPool: STICKER_POOL,
      })
      setFinished(true)
    } else {
      setIndex(index + 1)
    }
  }

  if (finished) {
    return (
      <main className="screen">
        <Confetti burst={1} />
        <Mascot mood="celebrate" size={140} />
        <h1 className="screen-title">A to Z — you did it all!</h1>
        <div className="editor-actions">
          <BigButton
            onClick={() => {
              setIndex(0)
              setFinished(false)
            }}
          >
            Parade again!
          </BigButton>
          <BigButton color="var(--ocean)" onClick={() => navigate('/world/letters')}>
            More games
          </BigButton>
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="play-header">
        <Link to="/world/letters" className="header-chip">
          ⬅ 🎈
        </Link>
        <span className="header-chip">🎪 Alphabet Parade</span>
      </header>

      <div className="parade-card squash" key={entry.letter}>
        <span className="parade-letter">
          {entry.letter}
          <span className="parade-lower">{entry.letter.toLowerCase()}</span>
        </span>
        <span className="parade-emoji">{entry.emoji}</span>
        <span className="parade-word">{entry.word}</span>
      </div>

      <div className="parade-dots" aria-hidden="true">
        {ALPHABET.map((e, i) => (
          <span key={e.letter} className={i <= index ? 'dot-on' : 'dot-off'}>
            •
          </span>
        ))}
      </div>

      <div className="editor-actions">
        <BigButton
          color="var(--ocean)"
          disabled={index === 0}
          onClick={() => {
            playPop()
            setIndex(index - 1)
          }}
        >
          ⬅ Back
        </BigButton>
        <BigButton onClick={() => speak(`${entry.letter}! ${entry.letter} is for ${entry.word}!`)}>
          🔊 Again
        </BigButton>
        <BigButton color="var(--leaf)" onClick={next}>
          {index === ALPHABET.length - 1 ? 'Finish! 🎉' : 'Next ➡'}
        </BigButton>
      </div>

      <Mascot mood="happy" size={90} />
    </main>
  )
}

/** Never used — the parade is free-play — but keeps the GameDef contract honest. */
function generateRound(): Round {
  const entry = ALPHABET[0]
  return {
    promptText: entry.letter,
    promptSpeech: entry.letter,
    choices: [{ id: entry.letter, label: entry.letter }],
    answerId: entry.letter,
    hints: { nudge: '', explain: '' },
  }
}

const alphabetParade: GameDef = {
  id: 'alphabetParade',
  world: 'letters',
  title: 'Alphabet Parade',
  emoji: '🎪',
  ages: '3–5',
  roundsPerSession: 1,
  generateRound,
  FreePlay,
}

export default alphabetParade
