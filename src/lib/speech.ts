let muted = false
let preferredVoice: SpeechSynthesisVoice | null = null

const NATURAL_VOICE_HINTS = [
  'natural', 'neural', 'premium', 'enhanced', 'google', 'aria', 'jenny', 'samantha', 'ava',
]

function selectVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis?.getVoices() ?? []
    const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
    const scored = english
      .map((voice) => ({
        voice,
        score: NATURAL_VOICE_HINTS.reduce(
          (total, hint) => total + (voice.name.toLowerCase().includes(hint) ? 10 : 0),
          voice.localService ? 2 : 0,
        ) + (voice.lang.toLowerCase() === 'en-us' ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score)
    return scored[0]?.voice ?? null
  } catch {
    return null
  }
}

let chosenVoiceName: string | null = null

/** Parent-chosen OS voice by name; null returns to automatic selection. */
export function setPreferredVoiceName(name: string | null): void {
  chosenVoiceName = name
}

/** English voices installed on this device (empty until the OS reports them). */
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  try {
    return (window.speechSynthesis?.getVoices() ?? []).filter((v) =>
      v.lang.toLowerCase().startsWith('en'),
    )
  } catch {
    return []
  }
}

function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (chosenVoiceName) {
    const chosen = getEnglishVoices().find((v) => v.name === chosenVoiceName)
    if (chosen) return chosen
    // Chosen on another device or voice was removed — fall back to automatic.
  }
  preferredVoice = selectVoice() ?? preferredVoice
  return preferredVoice
}

try {
  window.speechSynthesis?.addEventListener('voiceschanged', () => {
    preferredVoice = selectVoice()
  })
} catch {
  /* Speech unavailable. */
}

export function setSpeechMuted(m: boolean): void {
  muted = m
  if (m) {
    try {
      window.speechSynthesis?.cancel()
    } catch {
      /* not available — fine */
    }
  }
}

export function speak(text: string, opts?: { rate?: number; pitch?: number }): void {
  if (muted) return
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const voice = getPreferredVoice()
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'en-US'
    u.rate = opts?.rate ?? 0.9
    u.pitch = opts?.pitch ?? 1.03
    u.volume = 1
    synth.speak(u)
  } catch {
    // Speech unavailable — the app stays fully playable with text.
  }
}
