import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GameDef, Round } from '../types'
import type { WorldId } from '../../types'
import { useAppState } from '../../state/ProfilesContext'
import { parseAges, startingLevel } from '../../lib/ageFit'
import { shuffle } from '../../lib/rng'
import { STICKER_POOL, WORLDS } from '../registry'
import { speak } from '../../lib/speech'
import { playDing, playFanfare, playPop } from '../../lib/sfx'
import { Mascot } from '../../components/Mascot'
import { Confetti } from '../../components/Confetti'
import { BigButton } from '../../components/BigButton'
import { SoundToggle } from '../../components/SoundToggle'

export interface FlashCard {
  id: string
  front: string
  back: string
  promptSpeech: string
  answerSpeech: string
  detail?: string
}

export interface FlashCardConfig {
  id: string
  world: WorldId
  title: string
  emoji: string
  ages: string
  getCards(level: number): FlashCard[]
}

type Rating = 'known' | 'learning' | 'help'

function makeQueue(config: FlashCardConfig, level: number): FlashCard[] {
  return shuffle(config.getCards(level)).slice(0, 5)
}

function FlashCardPlayer({ config }: { config: FlashCardConfig }) {
  const { activeProfile, dispatch } = useAppState()
  const navigate = useNavigate()
  const startLevel = activeProfile ? startingLevel(activeProfile.age, parseAges(config.ages)) : 1
  const level = activeProfile?.progress[config.id]?.level ?? startLevel
  const [queue, setQueue] = useState(() => makeQueue(config, level))
  const [revealed, setRevealed] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [repeatCount, setRepeatCount] = useState<Record<string, number>>({})
  const [sessionStars, setSessionStars] = useState(0)
  const [finished, setFinished] = useState(false)

  const card = queue[0]

  useEffect(() => {
    if (card && !finished) speak(card.promptSpeech)
  }, [card, finished])

  if (!activeProfile || !card && !finished) return null

  const reveal = () => {
    if (!card || revealed) return
    playPop()
    setRevealed(true)
    speak(card.answerSpeech)
  }

  const rate = (rating: Rating) => {
    if (!card || !revealed) return
    const hintsUsed = rating === 'known' ? 0 : rating === 'learning' ? 1 : 2
    if (rating === 'help') dispatch({ type: 'recordHint', gameId: config.id, startLevel })
    dispatch({ type: 'recordCorrect', gameId: config.id, hintsUsed, stickerPool: STICKER_POOL, startLevel })
    playDing()
    const earned = hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1
    setSessionStars((stars) => stars + earned)

    const repeats = repeatCount[card.id] ?? 0
    const canRepeat = rating !== 'known' && repeats === 0 && reviewed < 5
    const nextQueue = [...queue.slice(1), ...(canRepeat ? [card] : [])]
    if (canRepeat) setRepeatCount((current) => ({ ...current, [card.id]: repeats + 1 }))
    setReviewed((count) => count + 1)
    setRevealed(false)

    if (nextQueue.length === 0) {
      playFanfare()
      speak('Flash card practice complete! Great remembering!')
      setFinished(true)
    } else {
      setQueue(nextQueue)
    }
  }

  const restart = () => {
    setQueue(makeQueue(config, level))
    setRevealed(false)
    setReviewed(0)
    setRepeatCount({})
    setSessionStars(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <main className="screen">
        <Confetti burst={1} />
        <Mascot mood="celebrate" size={140} />
        <h1 className="screen-title">Great practice, {activeProfile.name}!</h1>
        <p className="finish-stars">You earned {'⭐'.repeat(Math.min(sessionStars, 15))}</p>
        <p className="screen-subtitle">Cards marked “I’m learning” or “Help me” were gently repeated.</p>
        <div className="editor-actions">
          <BigButton onClick={restart}>Practice again</BigButton>
          <BigButton color="var(--ocean)" onClick={() => navigate(`/world/${config.world}`)}>More games</BigButton>
        </div>
      </main>
    )
  }

  return (
    <main className="screen flashcard-screen">
      <header className="play-header">
        <Link to={`/world/${config.world}`} className="header-chip">⬅ {WORLDS[config.world].emoji}</Link>
        <span className="header-chip">{config.emoji} {config.title}</span>
        <span className="header-chip" aria-label={`${reviewed} cards reviewed`}>{'⭐'.repeat(Math.min(reviewed, 5))}{'●'.repeat(Math.max(0, 5 - reviewed))}</span>
        <SoundToggle />
      </header>

      <p className="screen-subtitle">Think first, then tap the card to flip it.</p>

      <button
        className={`flash-card ${revealed ? 'revealed' : ''}`}
        onClick={reveal}
        aria-expanded={revealed}
        aria-label={revealed ? `${card.back}. ${card.detail ?? ''}` : `${card.front}. Tap to reveal.`}
      >
        <span className="flash-card-side flash-front">
          <span className="flash-card-content">{card.front}</span>
          <small>Tap to reveal</small>
        </span>
        <span className="flash-card-side flash-back" aria-hidden={!revealed}>
          <span className="flash-card-content">{card.back}</span>
          {card.detail && <small>{card.detail}</small>}
        </span>
      </button>

      <button className="speak-card" onClick={() => speak(revealed ? card.answerSpeech : card.promptSpeech)}>🔊 Hear it again</button>

      {revealed ? (
        <div className="rating-buttons" aria-label="How did that card feel?">
          <button className="rating-btn known" onClick={() => rate('known')}>😊 I knew it</button>
          <button className="rating-btn learning" onClick={() => rate('learning')}>🌱 I’m learning</button>
          <button className="rating-btn help" onClick={() => rate('help')}>💡 Help me</button>
        </div>
      ) : (
        <BigButton onClick={reveal}>Flip card</BigButton>
      )}

      <div className="game-mascot"><Mascot mood={revealed ? 'happy' : 'thinking'} size={92} /></div>
    </main>
  )
}

function placeholderRound(config: FlashCardConfig): Round {
  return {
    promptText: config.title,
    promptSpeech: config.title,
    choices: [{ id: 'flip', label: 'Flip' }],
    answerId: 'flip',
    hints: { nudge: 'Flip the card when you are ready.', explain: 'Practice helps your memory grow.' },
  }
}

export function makeFlashCardGame(config: FlashCardConfig): GameDef {
  return {
    ...config,
    roundsPerSession: 5,
    generateRound: () => placeholderRound(config),
    FreePlay: () => <FlashCardPlayer config={config} />,
  }
}
