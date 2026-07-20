import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent
  // iPadOS 13+ reports as Macintosh but has touch support.
  if (/iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document))
    return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

const STEPS: Record<ReturnType<typeof detectPlatform>, string[]> = {
  ios: [
    'Open pipsplayground.com in Safari (not Chrome).',
    'Tap the Share button — the square with an arrow, at the top of the screen on iPad.',
    'Scroll down the share menu and tap "Add to Home Screen".',
    'Tap "Add" in the top corner.',
    "Done! Pip's icon is now on the home screen and opens full-screen, even offline.",
  ],
  android: [
    'Open pipsplayground.com in Chrome.',
    'Tap the ⋮ menu in the top-right corner.',
    'Tap "Add to Home screen" (or "Install app").',
    'Confirm with "Install".',
    "Done! Pip's icon is now on the home screen and opens full-screen, even offline.",
  ],
  desktop: [
    'Open pipsplayground.com in Chrome or Edge.',
    'Click the install icon at the right end of the address bar (a screen with a down arrow).',
    'Click "Install".',
    "Done! Pip's Playground opens in its own window like a regular app.",
  ],
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches ?? false,
  )
  const platform = detectPlatform()

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed)
    return <p className="install-note">✓ Pip's Playground is installed on this device.</p>

  return (
    <section className="install-card" aria-labelledby="install-title">
      <h2 id="install-title">Install for quick, offline play</h2>
      {prompt ? (
        <>
          <p>One tap — this browser can install it for you:</p>
          <button
            className="manage-edit"
            onClick={async () => {
              await prompt.prompt()
              const choice = await prompt.userChoice
              if (choice.outcome === 'accepted') setPrompt(null)
            }}
          >
            Install app
          </button>
        </>
      ) : (
        <ol className="install-steps">
          {STEPS[platform].map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </section>
  )
}
