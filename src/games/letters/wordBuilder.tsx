import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GameDef, Round } from '../types'
import { generateWordRound, type WordRound } from './wordBuilderLogic'
import { useAppState } from '../../state/ProfilesContext'
import { STICKER_POOL } from '../registry'
import { newProgress, applyCorrect } from '../../lib/progress'
import { startingLevel } from '../../lib/ageFit'
import { Mascot, type MascotMood } from '../../components/Mascot'
import { Confetti } from '../../components/Confetti'
import { BigButton } from '../../components/BigButton'
import { speak } from '../../lib/speech'
import { playDing, playFanfare, playPop, playWhoosh } from '../../lib/sfx'

const WORDS_PER_SESSION = 5
const NEXT_WORD_DELAY = 1600

interface Tile {
  id: number
  letter: string
  used: boolean
}

function spellOut(word: string): string {
  return word.toUpperCase().split('').join(', ')
}

function FreePlay() {
  const { activeProfile, dispatch } = useAppState()
  const navigate = useNavigate()
  const startLevel = activeProfile ? startingLevel(activeProfile.age, [5, 6]) : 1
  const level = activeProfile?.progress['wordBuilder']?.level ?? startLevel

  const [wordsDone, setWordsDone] = useState(0)
  const [sessionStars, setSessionStars] = useState(0)
  const [finished, setFinished] = useState(false)
  const [leveledUp, setLeveledUp] = useState(false)
  const usedWords = useRef(new Set<string>())
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [wr, setWr] = useState<WordRound>(() => generateWordRound(level))
  const [tiles, setTiles] = useState<Tile[]>(() =>
    wr.bank.map((letter, id) => ({ id, letter, used: false })),
  )
  const [filled, setFilled] = useState(0)
  const [tier, setTier] = useState(0)
  const [maxTier, setMaxTier] = useState(0)
  const [wrongTiles, setWrongTiles] = useState<Set<number>>(new Set())

  const word = wr.word.word
  const wordComplete = filled >= word.length

  const startWord = (lvl: number) => {
    usedWords.current.add(word)
    const next = generateWordRound(lvl, usedWords.current)
    setWr(next)
    setTiles(next.bank.map((letter, id) => ({ id, letter, used: false })))
    setFilled(0)
    setTier(0)
    setMaxTier(0)
    setWrongTiles(new Set())
  }

  useEffect(() => {
    if (!finished) {
      speak(`Spell ${word}! ${spellOut(word)}! ${word}!`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, finished])

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!activeProfile) return null

  const needed = word[filled]

  const tapTile = (tile: Tile) => {
    if (tile.used || wordComplete || finished) return

    if (tile.letter === needed) {
      const newFilled = filled + 1
      setTiles(tiles.map((t) => (t.id === tile.id ? { ...t, used: true } : t)))
      setFilled(newFilled)
      setTier(0)
      setWrongTiles(new Set())

      if (newFilled >= word.length) {
        // Word complete!
        playDing()
        const current = activeProfile.progress['wordBuilder'] ?? newProgress(startLevel)
        const result = applyCorrect(current, maxTier)
        if (result.leveledUp) {
          setLeveledUp(true)
          playFanfare()
          speak(`${word}! Level up! Amazing, ${activeProfile.name}!`)
        } else {
          speak(`${spellOut(word)} spells ${word}! Woohoo!`)
        }
        dispatch({
          type: 'recordCorrect',
          gameId: 'wordBuilder',
          hintsUsed: maxTier,
          stickerPool: STICKER_POOL,
          startLevel,
        })
        setSessionStars((s) => s + result.starsEarned)
        const isLast = wordsDone + 1 >= WORDS_PER_SESSION
        timer.current = setTimeout(() => {
          setLeveledUp(false)
          if (isLast) {
            playFanfare()
            speak('You spelled them all! Hooray!')
            setFinished(true)
          } else {
            setWordsDone((n) => n + 1)
            startWord(result.leveledUp ? result.progress.level : level)
          }
        }, NEXT_WORD_DELAY + (result.leveledUp ? 800 : 0))
      } else {
        playPop()
      }
      return
    }

    // Wrong letter — escalate warmly.
    playWhoosh()
    dispatch({ type: 'recordHint', gameId: 'wordBuilder', startLevel })
    const newTier = Math.min(tier + 1, 3)
    setTier(newTier)
    setMaxTier((m) => Math.max(m, newTier))
    setWrongTiles(new Set(wrongTiles).add(tile.id))
    if (newTier === 1) speak(`Ooh, not that one! Listen: ${spellOut(word)}. What comes next?`)
    else if (newTier === 2) speak(`Sound it out slowly: ${spellOut(word)}!`)
    else speak(`The next letter is ${needed.toUpperCase()}! Tap the sparkly ${needed.toUpperCase()}!`)
  }

  const mood: MascotMood = finished
    ? 'celebrate'
    : wordComplete
      ? 'happy'
      : tier > 0
        ? 'thinking'
        : 'idle'

  if (finished) {
    return (
      <main className="screen">
        <Confetti burst={1} />
        <Mascot mood="celebrate" size={140} />
        <h1 className="screen-title">Super spelling, {activeProfile.name}!</h1>
        <p className="finish-stars">
          You earned {'⭐'.repeat(Math.min(sessionStars, 15))}
          {sessionStars > 15 ? ` ×${sessionStars}` : ''}
        </p>
        <div className="editor-actions">
          <BigButton
            onClick={() => {
              playPop()
              usedWords.current.clear()
              setWordsDone(0)
              setSessionStars(0)
              setFinished(false)
              startWord(activeProfile.progress['wordBuilder']?.level ?? startLevel)
            }}
          >
            Play again!
          </BigButton>
          <BigButton color="var(--ocean)" onClick={() => navigate('/world/letters')}>
            More games
          </BigButton>
        </div>
      </main>
    )
  }

  return (
    <main className="screen game-screen">
      <header className="play-header">
        <Link to="/world/letters" className="header-chip">
          ⬅ 🎈
        </Link>
        <span className="header-chip">🔤 Word Builder</span>
        <span className="header-chip">
          {Array.from({ length: WORDS_PER_SESSION }, (_, i) => (
            <span key={i} className={i <= wordsDone ? '' : 'dot-dim'}>
              {i < wordsDone || (i === wordsDone && wordComplete) ? '⭐' : '●'}
            </span>
          ))}
        </span>
      </header>

      {leveledUp && <div className="levelup-banner">🎉 Level up!</div>}

      <h1 className="game-prompt">
        <button
          className="speak-again"
          aria-label="Hear it again"
          onClick={() => speak(`Spell ${word}! ${spellOut(word)}! ${word}!`)}
        >
          🔊
        </button>
        Spell it!
      </h1>

      <div className="word-picture">{wr.word.emoji}</div>

      <div className="word-slots">
        {word.split('').map((letter, i) => (
          <span
            key={i}
            className={`word-slot ${i < filled ? 'filled squash' : ''} ${i === filled ? 'next-slot' : ''}`}
          >
            {i < filled ? letter : ''}
          </span>
        ))}
      </div>

      <div className="letter-bank">
        {tiles.map((tile) => {
          const isNeeded = tile.letter === needed
          const dimmed = !tile.used && ((tier >= 2 && wrongTiles.has(tile.id)) || (tier >= 3 && !isNeeded))
          return (
            <button
              key={tile.id}
              className={[
                'choice-btn',
                'letter-tile',
                tile.used ? 'tile-used' : '',
                dimmed ? 'dimmed' : '',
                tier >= 3 && isNeeded && !tile.used ? 'revealed' : '',
                wrongTiles.has(tile.id) && !dimmed ? 'wobble' : '',
              ].join(' ')}
              disabled={tile.used || (tier >= 3 && !isNeeded)}
              onClick={() => tapTile(tile)}
            >
              {tile.letter}
            </button>
          )
        })}
      </div>

      <div className="game-mascot">
        <Mascot mood={mood} size={96} />
        {tier === 1 && !wordComplete && (
          <div className="speech-bubble">Listen: {spellOut(word)}!</div>
        )}
        {tier >= 3 && !wordComplete && (
          <div className="speech-bubble">The next letter is {needed.toUpperCase()}!</div>
        )}
      </div>
    </main>
  )
}

/** Unused — Word Builder is fully custom — but satisfies the GameDef contract. */
function generateRound(): Round {
  return {
    promptText: 'Spell it!',
    promptSpeech: 'Spell it!',
    choices: [{ id: 'x', label: 'x' }],
    answerId: 'x',
    hints: { nudge: '', explain: '' },
  }
}

const wordBuilder: GameDef = {
  id: 'wordBuilder',
  world: 'letters',
  title: 'Word Builder',
  emoji: '🔤',
  ages: '5–6',
  roundsPerSession: WORDS_PER_SESSION,
  generateRound,
  FreePlay,
}

export default wordBuilder
