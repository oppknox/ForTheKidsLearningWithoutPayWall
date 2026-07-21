import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GameDef, Round, RoundContext } from './types'
import { initialRound, pick, type RoundState } from './hintMachine'
import { useAppState } from '../state/ProfilesContext'
import { newProgress, applyCorrect } from '../lib/progress'
import { parseAges, startingLevel } from '../lib/ageFit'
import { STICKER_POOL, WORLDS } from './registry'
import { Mascot, type MascotMood } from '../components/Mascot'
import { Confetti } from '../components/Confetti'
import { SessionRecap } from '../components/SessionRecap'
import { speak } from '../lib/speech'
import { playDing, playFanfare, playPop, playWhoosh } from '../lib/sfx'
import { SoundToggle } from '../components/SoundToggle'
import { highlightFromRound } from '../lib/sessionHighlight'
import { isMissionComplete, missionStatus } from '../lib/dailyMission'
import {
  applyAdaptiveAnswer,
  initialAdaptive,
  type AdaptiveState,
} from '../lib/adaptiveLevel'
import type { Profile } from '../types'

const NEXT_ROUND_DELAY = 1400

interface SessionState {
  roundIndex: number
  round: Round
  rs: RoundState
  sessionStars: number
  finished: boolean
  highlights: string[]
  leveledUpThisSession: boolean
  lastSticker: string | null
  missionCompletedThisSession: boolean
  adaptive: AdaptiveState
  recentItemIds: string[]
}

function buildRoundContext(profile: Profile | null, recentItemIds: string[]): RoundContext {
  return {
    recentItemIds,
    allMastery: profile?.itemMastery,
  }
}

export function GameShell({ game }: { game: GameDef }) {
  const { activeProfile, dispatch } = useAppState()
  const navigate = useNavigate()
  const [burst, setBurst] = useState(0)
  const [levelUpSticker, setLevelUpSticker] = useState<string | null>(null)
  const [leveledUp, setLeveledUp] = useState(false)
  const [adaptBanner, setAdaptBanner] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const missionWasComplete = useRef(false)

  const startLevel = activeProfile
    ? startingLevel(activeProfile.age, parseAges(game.ages))
    : 1
  const profileLevel = activeProfile?.progress[game.id]?.level ?? startLevel

  const makeRound = useCallback(
    (level: number, recentItemIds: string[], profile: Profile | null) =>
      game.generateRound(level, buildRoundContext(profile, recentItemIds)),
    [game],
  )

  const startRound = useCallback(
    (
      roundIndex: number,
      sessionStars: number,
      highlights: string[] = [],
      meta?: Partial<SessionState>,
      profile: Profile | null = activeProfile,
    ): SessionState => {
      const adaptive = meta?.adaptive ?? initialAdaptive(profileLevel)
      const recentItemIds = meta?.recentItemIds ?? []
      return {
        roundIndex,
        round: makeRound(adaptive.level, recentItemIds, profile),
        rs: initialRound(),
        sessionStars,
        finished: false,
        highlights,
        leveledUpThisSession: meta?.leveledUpThisSession ?? false,
        lastSticker: meta?.lastSticker ?? null,
        missionCompletedThisSession: meta?.missionCompletedThisSession ?? false,
        adaptive,
        recentItemIds,
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, profileLevel, makeRound],
  )

  const [session, setSession] = useState<SessionState>(() =>
    startRound(0, 0, [], undefined, activeProfile),
  )

  useEffect(() => {
    if (activeProfile) {
      missionWasComplete.current = isMissionComplete(activeProfile)
    }
  }, [activeProfile?.id]) // only on profile switch / mount

  // Speak the prompt whenever a new round begins.
  useEffect(() => {
    if (!session.finished) speak(session.round.promptSpeech)
  }, [session.round, session.finished])

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!activeProfile) return null

  const { round, rs } = session
  const tier = rs.hintTier
  const statusMessage = session.finished
    ? `Session complete. You earned ${session.sessionStars} stars.`
    : rs.solved
      ? 'Correct! Great job!'
      : tier === 1
        ? round.hints.nudge
        : tier >= 3
          ? round.hints.explain
          : ''

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
      const current = activeProfile.progress[game.id] ?? newProgress(startLevel)
      const result = applyCorrect(current, hintsUsed)
      const highlight = highlightFromRound(round)
      const highlights = session.highlights.includes(highlight)
        ? session.highlights
        : [...session.highlights, highlight]

      const adaptive = applyAdaptiveAnswer(session.adaptive, hintsUsed)
      const recentItemIds = round.itemId
        ? [...session.recentItemIds, round.itemId].slice(-8)
        : session.recentItemIds

      let sticker: string | null = session.lastSticker
      let sessionLeveled = session.leveledUpThisSession
      if (result.leveledUp) {
        sticker = STICKER_POOL.find((s) => !activeProfile.stickers.includes(s)) ?? null
        setLevelUpSticker(sticker)
        setLeveledUp(true)
        sessionLeveled = true
        playFanfare()
        setBurst((b) => b + 1)
        speak(`Level up! Amazing, ${activeProfile.name}!`)
      } else if (adaptive.bumpedUp) {
        setAdaptBanner('A little trickier — you are ready!')
        speak('A little trickier now. You are ready!')
      } else if (adaptive.easedDown) {
        setAdaptBanner('Let’s take an easier path for a bit.')
        speak(pickPraise())
      } else {
        speak(pickPraise())
      }

      dispatch({
        type: 'recordCorrect',
        gameId: game.id,
        hintsUsed,
        stickerPool: STICKER_POOL,
        startLevel,
        highlight,
        itemId: round.itemId,
      })

      const mission = missionStatus(activeProfile)
      const missionGameMatch = mission.game.id === game.id
      const nextMissionCount = missionGameMatch ? mission.correct + 1 : mission.correct
      const missionJustDone =
        missionGameMatch &&
        !missionWasComplete.current &&
        (mission.complete || nextMissionCount >= mission.target)
      if (missionJustDone) missionWasComplete.current = true

      const isLast = session.roundIndex + 1 >= game.roundsPerSession
      setSession({
        ...session,
        rs: next,
        sessionStars: session.sessionStars + result.starsEarned,
        highlights,
        leveledUpThisSession: sessionLeveled,
        lastSticker: sticker,
        missionCompletedThisSession:
          session.missionCompletedThisSession || missionJustDone,
        adaptive,
        recentItemIds,
      })
      timer.current = setTimeout(() => {
        setLeveledUp(false)
        setLevelUpSticker(null)
        setAdaptBanner(null)
        if (isLast) {
          playFanfare()
          setBurst((b) => b + 1)
          speak('You did it! Hooray!')
          setSession((s) => ({ ...s, finished: true }))
        } else {
          setSession((s) =>
            startRound(
              s.roundIndex + 1,
              s.sessionStars,
              s.highlights,
              {
                leveledUpThisSession: s.leveledUpThisSession,
                lastSticker: s.lastSticker,
                missionCompletedThisSession: s.missionCompletedThisSession,
                adaptive: s.adaptive,
                recentItemIds: s.recentItemIds,
              },
              activeProfile,
            ),
          )
        }
      }, NEXT_ROUND_DELAY + (result.leveledUp ? 800 : 0))
      return
    }

    // A miss — escalate warmly.
    playWhoosh()
    dispatch({ type: 'recordHint', gameId: game.id, startLevel })
    if (next.hintTier === 1) speak(`${pickEncourage()} ${round.hints.nudge}`)
    else if (next.hintTier === 2) speak(pickEncourage())
    else speak(round.hints.explain)
    setSession({ ...session, rs: next })
  }

  if (session.finished) {
    return (
      <SessionRecap
        name={activeProfile.name}
        sessionStars={session.sessionStars}
        highlights={session.highlights}
        leveledUp={session.leveledUpThisSession}
        sticker={session.lastSticker}
        profile={activeProfile}
        missionJustCompleted={session.missionCompletedThisSession}
        burst={burst}
        onPlayAgain={() => {
          playPop()
          missionWasComplete.current = isMissionComplete(activeProfile)
          setSession(startRound(0, 0, [], undefined, activeProfile))
        }}
        onMoreGames={() => navigate(`/world/${game.world}`)}
      />
    )
  }

  const Display = game.Display

  return (
    <main className={`screen game-screen game-${game.id}`}>
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
        <SoundToggle />
      </header>

      <p className="sr-only" role="status" aria-live="polite">{statusMessage}</p>

      {leveledUp && (
        <div className="levelup-banner">
          🎉 Level up!{' '}
          {levelUpSticker ? `New sticker: ${levelUpSticker}` : 'You are unstoppable!'}
        </div>
      )}
      {!leveledUp && adaptBanner && (
        <div className="adapt-banner" role="status">
          {adaptBanner}
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
