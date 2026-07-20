import { useEffect, useState } from 'react'
import { useAppState } from '../state/ProfilesContext'
import { getEnglishVoices, speak } from '../lib/speech'

/** Grown-ups control: pick which of this device's voices reads to the kids. */
export function VoicePicker() {
  const { state, dispatch } = useAppState()
  const [voices, setVoices] = useState(getEnglishVoices)

  useEffect(() => {
    const refresh = () => setVoices(getEnglishVoices())
    refresh() // some browsers populate voices late
    try {
      window.speechSynthesis?.addEventListener('voiceschanged', refresh)
      return () => window.speechSynthesis?.removeEventListener('voiceschanged', refresh)
    } catch {
      return undefined
    }
  }, [])

  if (voices.length === 0) return null

  return (
    <section className="voice-picker">
      <label htmlFor="voice-select">
        <strong>Reading voice</strong> — voices come from this device, so each
        device has its own list.
      </label>
      <div className="voice-row">
        <select
          id="voice-select"
          className="voice-select"
          value={state.voiceName ?? ''}
          onChange={(e) =>
            dispatch({ type: 'setVoice', voiceName: e.target.value || null })
          }
        >
          <option value="">Automatic (best available)</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        <button
          className="manage-edit"
          type="button"
          onClick={() => speak('Hi! I am Pip, and this is my reading voice!')}
        >
          🔊 Preview
        </button>
      </div>
    </section>
  )
}
