import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches ?? false,
  )
  const isiPad = /iPad|iPhone|iPod/.test(navigator.userAgent)

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

  if (installed) return <p className="install-note">✓ Pip's Playground is installed on this device.</p>

  return (
    <section className="install-card" aria-labelledby="install-title">
      <div>
        <h2 id="install-title">Install for quick, offline play</h2>
        <p>
          {isiPad
            ? 'In Safari, tap Share, then Add to Home Screen, and turn on Open as Web App.'
            : 'Add Pip’s Playground to this device for an app-like, full-screen experience.'}
        </p>
      </div>
      {prompt && (
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
      )}
    </section>
  )
}
