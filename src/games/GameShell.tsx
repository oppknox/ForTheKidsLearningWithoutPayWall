import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GameDef } from './types'
import type { Round } from './types'
import { initialRound, pick, type RoundState } from './hintMachine'
import { useAppState } from '../state/ProfilesContext'
import { newProgress, applyCorrect } from '../lib/progress'
import { STICKER_POOL, WORLDS } from './registry'
import { Mascot, type MascotMood } from '../components/Mascot'
import { Confetti } from '../components/Confetti'
import { BigButton } from '../components/BigButton'
import { speak } from '../lib/speech'
import { playDing, playFanfare, playPop, playWhoosh } from '../lib/sfx'

const NEXT_ROUND_DELAY = 1400

interface SessionState {
  roundIndex: number
  round: Round
  rs: RoundState
  sessionStars: number
  finished: boolean
}

export function GameShell({ game }: { game: GameDef }) {
  const { activeProfile, dispatch } = useAppState()
  const navigate = useNavigate()
  const [burst, setBurst] = useState(0)
  const [levelUpSticker, setLevelUpSticker] = useState<string | null>(null)
  const [leveledUp, setLeveledUp] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const level = activeProfile?.progress[game.id]?.level ?? 1

  const startRound = useCallback(
    (roundIndex: number, sessionStars: number): SessionState => ({
      roundIndex,
      round: game.generateRound(level),
      rs: initialRound(),
      sessionStars,
      finished: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game],
  )

  const [session, setSession] = useState<SessionState>(() => startRound(0, 0))

  // Speak the prompt whenever a new round begins.
  useEffect(() => {
    if (!session.finished) speak(session.round.promptSpeech)
  }, [session.round, session.finished])

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!activeProfile) return null

  const { round, rs } = session
  const tier = rs.hintTier

  const mood: MascotMood = session.finished
    ? 'celebrate'
    : rs.solved
      ? 'happy'
      : tier > 0
        ? 'thinking'
        : 'idle'

  const onChoice = (choiceId: string) => {
    if (rs.solved || session.finished) return
    const next = pick(rs, choiceId, round.answerId)

    if (next.solved) {
      const hintsUsed = rs.hintTier
      playDing()
      const current = activeProfile.progress[game.id] ?? newProgress()
      const result = applyCorrect(current, hintsUsed)
      if (result.leveledUp) {
        const sticker = STICKER_POOL.find((s) => !activeProfile.stickers.includes(s)) ?? null
        setLevelUpSticker(sticker)
        setLeveledUp(true)
        playFanfare()
        setBurst((b) => b + 1)
        speak(`Level up! Amazing, ${activeProfile.name}!`)
      } else {
        speak(pickPraise())
      }
      dispatch({
        type: 'recordCorrect',
        gameId: game.id,
        hintsUsed,
        stickerPool: STICKER_POOL,
      })
      const isLast = session.roundIndex + 1 >= game.roundsPerSession
      setSession({ ...session, rs: next, sessionStars: session.sessionStars + result.starsEarned })
      timer.current = setTimeout(() => {
        setLeveledUp(false)
        setLevelUpSticker(null)
        if (isLast) {
          playFanfare()
          setBurst((b) => b + 1)
          speak('You did it! Hooray!')
          setSession((s) => ({ ...s, finished: true }))
        } else {
          setSession((s) => startRound(s.roundIndex + 1, s.sessionStars))
        }
      }, NEXT_ROUND_DELAY + (result.leveledUp ? 800 : 0))
      return
    }

    // A miss — escalate warmly.
    playWhoosh()
    dispatch({ type: 'recordHint', gameId: game.id })
    if (next.hintTier === 1) speak(`${pickEncourage()} ${round.hints.nudge}`)
    else if (next.hintTier === 2) speak(pickEncourage())
    else speak(round.hints.explain)
    setSession({ ...session, rs: next })
  }

  if (session.finished) {
    return (
      <main className="screen">
        <Confetti burst={burst} />
        <Mascot mood="celebrate" size={140} />
        <h1 className="screen-title">Hooray, {activeProfile.name}!</h1>
        <p className="finish-stars">
          You earned {'⭐'.repeat(Math.min(session.sessionStars, 15))}
          {session.sessionStars > 15 ? ` ×${session.sessionStars}` : ''}
        </p>
        <div className="editor-actions">
          <BigButton
            onClick={() => {
              playPop()
              setSession(startRound(0, 0))
            }}
          >
            Play again!
          </BigButton>
          <BigButton color="var(--ocean)" onClick={() => navigate(`/world/${game.world}`)}>
            More games
          </BigButton>
        </div>
      </main>
    )
  }

  const Display = game.Display

  return (
    <main className="screen game-screen">
      <Confetti burst={burst} />
      <header className="play-header">
        <Link to={`/world/${game.world}`} className="header-chip">
          ⬅ {WORLDS[game.world].emoji}
        </Link>
        <span className="header-chip">
          {game.emoji} {game.title}
        </span>
        <span className="header-chip">
          {Array.from({ length: game.roundsPerSession }, (_, i) => (
            <span key={i} className={i <= session.roundIndex ? '' : 'dot-dim'}>
              {i < session.roundIndex || (i === session.roundIndex && rs.solved) ? '⭐' : '●'}
            </span>
          ))}
        </span>
      </header>

      {leveledUp && (
        <div className="levelup-banner">
          🎉 Level up!{' '}
          {levelUpSticker ? `New sticker: ${levelUpSticker}` : 'You are unstoppable!'}
        </div>
      )}

      <h1 className="game-prompt">
        <button
          className="speak-again"
          aria-label="Hear it again"
          onClick={() => speak(round.promptSpeech)}
        >
          🔊
        </button>
        {round.promptText}
      </h1>

      {Display && (
        <div className="game-display">
          <Display round={round} hintTier={tier} solved={rs.solved} />
        </div>
      )}

      <div className={`choice-grid ${isBalloons(round) ? 'balloon-grid' : ''}`}>
        {round.choices.map((c) => {
          const isAnswer = c.id === round.answerId
          const isWrong = rs.wrongIds.includes(c.id)
          const revealed = tier >= 3 && isAnswer
          const dimmed = (tier >= 2 && isWrong) || (tier >= 3 && !isAnswer)
          return (
            <button
              key={c.id}
              className={[
                'choice-btn',
                isBalloons(round) ? 'balloon-btn' : '',
                rs.solved && isAnswer ? 'correct-pick squash' : '',
                isWrong && !dimmed ? 'wobble' : '',
                dimmed ? 'dimmed' : '',
                revealed ? 'revealed' : '',
              ].join(' ')}
              disabled={tier >= 3 && !isAnswer}
              onClick={() => onChoice(c.id)}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="game-mascot">
        <Mascot mood={mood} size={96} />
        {tier === 1 && <div className="speech-bubble">{round.hints.nudge}</div>}
        {tier >= 3 && <div className="speech-bubble">{round.hints.explain}</div>}
      </div>
    </main>
  )
}

function isBalloons(round: Round): boolean {
  return Boolean((round.payload as { balloons?: boolean } | undefined)?.balloons)
}

const PRAISE = ['Yes!', 'Woohoo!', 'You got it!', 'Super!', 'Amazing!', 'High five!']
const ENCOURAGE = ['Ooh, so close!', 'Almost!', 'Good try!', "Let's look again!"]

function pickPraise(): string {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)]
}

function pickEncourage(): string {
  return ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]
}
