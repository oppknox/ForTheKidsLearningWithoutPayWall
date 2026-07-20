import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useAppState } from '../state/ProfilesContext'
import { normalizeState } from '../lib/storage'
import {
  createVault,
  deleteVault,
  loadSyncConfig,
  restoreVault,
  saveSyncConfig,
  updateVault,
  type SyncConfig,
} from '../lib/cloudSync'

type Status = { kind: 'idle' | 'working' | 'success' | 'error'; message: string }

function downloadState(state: unknown): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `pips-playground-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function BackupSync() {
  const { state, dispatch } = useAppState()
  const [config, setConfig] = useState<SyncConfig | null>(loadSyncConfig)
  const [recoveryInput, setRecoveryInput] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' })
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const refresh = () => setConfig(loadSyncConfig())
    const syncError = (event: Event) => {
      const message = (event as CustomEvent<string>).detail
      setStatus({ kind: 'error', message })
    }
    window.addEventListener('cloud-sync-change', refresh)
    window.addEventListener('cloud-sync-error', syncError)
    return () => {
      window.removeEventListener('cloud-sync-change', refresh)
      window.removeEventListener('cloud-sync-error', syncError)
    }
  }, [])

  const run = async (task: () => Promise<string>) => {
    setStatus({ kind: 'working', message: 'Working…' })
    try {
      setStatus({ kind: 'success', message: await task() })
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' })
    }
  }

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await run(async () => {
      const imported = normalizeState(JSON.parse(await file.text()) as unknown)
      if (!imported) throw new Error('That file is not a valid Pip’s Playground backup.')
      if (!confirm('Replace the profiles and progress on this device with this backup?')) return 'Import cancelled.'
      dispatch({ type: 'replaceState', state: imported })
      return 'Backup imported successfully.'
    })
  }

  return (
    <section className="backup-panel" aria-labelledby="backup-title">
      <div className="backup-heading">
        <div>
          <h2 id="backup-title">Backup & device sync</h2>
          <p>Your child can always play offline. Cloud backup is optional and encrypted on this device.</p>
        </div>
        <span className={`sync-indicator ${config ? 'connected' : ''}`}>{config ? 'Cloud connected' : 'Local only'}</span>
      </div>

      <div className="backup-actions">
        <button className="manage-edit" onClick={() => downloadState(state)}>Export backup file</button>
        <button className="manage-edit secondary" onClick={() => fileInput.current?.click()}>Import backup file</button>
        <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={importFile} />
      </div>

      {!config ? (
        <div className="vault-setup">
          <button
            className="manage-edit"
            disabled={status.kind === 'working'}
            onClick={() => void run(async () => {
              const created = await createVault(state)
              setConfig(created)
              setShowCode(true)
              return 'Encrypted cloud backup created. Save your recovery code now.'
            })}
          >
            Create encrypted cloud backup
          </button>
          <div className="restore-row">
            <label htmlFor="recovery-code">Already have a recovery code?</label>
            <textarea
              id="recovery-code"
              rows={3}
              value={recoveryInput}
              onChange={(event) => setRecoveryInput(event.target.value)}
              placeholder="PIP1.…"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              className="manage-edit"
              disabled={!recoveryInput.trim() || status.kind === 'working'}
              onClick={() => void run(async () => {
                const restored = await restoreVault(recoveryInput)
                const normalized = normalizeState(restored.state)
                if (!normalized) throw new Error('The cloud backup contains invalid data.')
                if (!confirm('Replace the profiles and progress on this device with the cloud backup?')) return 'Restore cancelled.'
                saveSyncConfig(restored.config)
                setConfig(restored.config)
                dispatch({ type: 'replaceState', state: normalized })
                setRecoveryInput('')
                return 'Cloud backup restored and sync enabled.'
              })}
            >
              Restore and connect
            </button>
          </div>
        </div>
      ) : (
        <div className="connected-vault">
          <p>
            Last cloud backup: <strong>{config.updatedAt ? new Date(config.updatedAt).toLocaleString() : 'Not yet'}</strong>
          </p>
          <div className="backup-actions">
            <button className="manage-edit" onClick={() => void run(async () => {
              const next = await updateVault(state, config)
              setConfig(next)
              return 'Cloud backup is up to date.'
            })}>Back up now</button>
            <button className="manage-edit secondary" onClick={() => setShowCode((shown) => !shown)}>
              {showCode ? 'Hide recovery code' : 'Show recovery code'}
            </button>
            <button className="manage-delete" onClick={() => void run(async () => {
              if (!confirm('Permanently delete this encrypted cloud backup? Local progress will remain on this device.')) return 'Deletion cancelled.'
              await deleteVault(config)
              setConfig(null)
              setShowCode(false)
              return 'Cloud backup deleted. This device is local-only again.'
            })}>Delete cloud backup</button>
          </div>
          {showCode && (
            <div className="recovery-box">
              <strong>Save this private recovery code</strong>
              <code>{config.recoveryCode}</code>
              <button className="manage-edit" onClick={() => void navigator.clipboard.writeText(config.recoveryCode).then(
                () => setStatus({ kind: 'success', message: 'Recovery code copied.' }),
                () => setStatus({ kind: 'error', message: 'Could not copy. Select and copy the code manually.' }),
              )}>Copy recovery code</button>
              <small>Anyone with this code can restore the family backup. Pip’s Playground cannot recover it for you.</small>
            </div>
          )}
        </div>
      )}

      {status.message && <p className={`backup-status ${status.kind}`} role="status">{status.message}</p>}
    </section>
  )
}
