let muted = false
let ctx: AudioContext | null = null

export function setSfxMuted(m: boolean): void {
  muted = m
}

function getCtx(): AudioContext | null {
  if (muted) return null
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.15,
  glideTo?: number,
): void {
  const ac = getCtx()
  if (!ac) return
  try {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const t0 = ac.currentTime + start
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(gainPeak, t0 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
    osc.connect(gain).connect(ac.destination)
    osc.start(t0)
    osc.stop(t0 + duration + 0.05)
  } catch {
    /* audio hiccup — ignore */
  }
}

export function playPop(): void {
  tone(600, 0, 0.12, 'sine', 0.2, 900)
}

export function playDing(): void {
  tone(880, 0, 0.15, 'triangle')
  tone(1318, 0.12, 0.25, 'triangle')
}

export function playFanfare(): void {
  tone(523, 0, 0.18, 'triangle', 0.18)
  tone(659, 0.15, 0.18, 'triangle', 0.18)
  tone(784, 0.3, 0.18, 'triangle', 0.18)
  tone(1046, 0.45, 0.45, 'triangle', 0.2)
}

export function playWhoosh(): void {
  tone(400, 0, 0.25, 'sine', 0.08, 200)
}
