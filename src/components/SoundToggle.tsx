import { useAppState } from '../state/ProfilesContext'

/** A child-accessible sound control that does not require the grown-up gate. */
export function SoundToggle() {
  const { state, dispatch } = useAppState()
  return (
    <button
      className="header-chip sound-toggle"
      type="button"
      aria-pressed={state.muted}
      aria-label={state.muted ? 'Turn sound on' : 'Turn sound off'}
      onClick={() => dispatch({ type: 'setMuted', muted: !state.muted })}
    >
      <span aria-hidden="true">{state.muted ? '🔇' : '🔊'}</span>
      <span>{state.muted ? 'Sound off' : 'Sound on'}</span>
    </button>
  )
}
