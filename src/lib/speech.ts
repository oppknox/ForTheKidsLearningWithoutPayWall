let muted = false

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
    u.rate = opts?.rate ?? 0.95
    u.pitch = opts?.pitch ?? 1.15
    synth.speak(u)
  } catch {
    // Speech unavailable — the app stays fully playable with text.
  }
}
