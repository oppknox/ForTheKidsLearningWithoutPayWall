import type { AppState } from '../types'

const SYNC_KEY = 'ftk-cloud-sync-v1'
const CODE_PREFIX = 'PIP1'

export interface SyncConfig {
  recoveryCode: string
  version: number
  updatedAt: number
}

interface RecoveryParts {
  vaultId: string
  authToken: string
  encryptionKey: string
}

interface EncryptedVault {
  ciphertext: string
  iv: string
}

interface VaultResponse extends EncryptedVault {
  version: number
  updatedAt: number
}

export class SyncConflictError extends Error {}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function randomToken(size: number): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(size)))
}

function parseRecoveryCode(code: string): RecoveryParts {
  const compact = code.trim().replaceAll(' ', '')
  const [prefix, vaultId, authToken, encryptionKey] = compact.split('.')
  if (prefix !== CODE_PREFIX || !vaultId || !authToken || !encryptionKey) {
    throw new Error('That recovery code is not valid.')
  }
  if (base64UrlToBytes(vaultId).length !== 16 || base64UrlToBytes(authToken).length !== 32 || base64UrlToBytes(encryptionKey).length !== 32) {
    throw new Error('That recovery code is not valid.')
  }
  return { vaultId, authToken, encryptionKey }
}

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return bytesToBase64Url(new Uint8Array(digest))
}

async function importEncryptionKey(encoded: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', base64UrlToBytes(encoded), 'AES-GCM', false, ['encrypt', 'decrypt'])
}

async function encryptState(state: AppState, encodedKey: string): Promise<EncryptedVault> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await importEncryptionKey(encodedKey)
  const plaintext = new TextEncoder().encode(JSON.stringify(state))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  return { ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)), iv: bytesToBase64Url(iv) }
}

async function decryptState(vault: EncryptedVault, encodedKey: string): Promise<AppState> {
  const key = await importEncryptionKey(encodedKey)
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64UrlToBytes(vault.iv) },
    key,
    base64UrlToBytes(vault.ciphertext),
  )
  return JSON.parse(new TextDecoder().decode(plaintext)) as AppState
}

async function api(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (response.status === 409) throw new SyncConflictError('A newer cloud backup already exists on another device.')
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Cloud backup is unavailable.' })) as { error?: string }
    throw new Error(body.error ?? 'Cloud backup is unavailable.')
  }
  return response
}

export function loadSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(SYNC_KEY)
    return raw ? JSON.parse(raw) as SyncConfig : null
  } catch {
    return null
  }
}

export function saveSyncConfig(config: SyncConfig | null): void {
  if (config) localStorage.setItem(SYNC_KEY, JSON.stringify(config))
  else localStorage.removeItem(SYNC_KEY)
  window.dispatchEvent(new Event('cloud-sync-change'))
}

export async function createVault(state: AppState): Promise<SyncConfig> {
  const parts: RecoveryParts = { vaultId: randomToken(16), authToken: randomToken(32), encryptionKey: randomToken(32) }
  const recoveryCode = `${CODE_PREFIX}.${parts.vaultId}.${parts.authToken}.${parts.encryptionKey}`
  const encrypted = await encryptState(state, parts.encryptionKey)
  const response = await api(`/api/vaults/${parts.vaultId}`, {
    method: 'POST',
    body: JSON.stringify({ ...encrypted, authHash: await hash(parts.authToken) }),
  })
  const result = await response.json() as { version: number; updatedAt: number }
  const config = { recoveryCode, ...result }
  saveSyncConfig(config)
  return config
}

export async function updateVault(state: AppState, config = loadSyncConfig()): Promise<SyncConfig> {
  if (!config) throw new Error('Cloud backup is not set up.')
  const parts = parseRecoveryCode(config.recoveryCode)
  const encrypted = await encryptState(state, parts.encryptionKey)
  const response = await api(`/api/vaults/${parts.vaultId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${parts.authToken}` },
    body: JSON.stringify({ ...encrypted, expectedVersion: config.version }),
  })
  const result = await response.json() as { version: number; updatedAt: number }
  const next = { ...config, ...result }
  saveSyncConfig(next)
  return next
}

export async function restoreVault(recoveryCode: string): Promise<{ state: AppState; config: SyncConfig }> {
  const parts = parseRecoveryCode(recoveryCode)
  const response = await api(`/api/vaults/${parts.vaultId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${parts.authToken}` },
  })
  const vault = await response.json() as VaultResponse
  const state = await decryptState(vault, parts.encryptionKey)
  const config = { recoveryCode: recoveryCode.trim().replaceAll(' ', ''), version: vault.version, updatedAt: vault.updatedAt }
  return { state, config }
}

export async function deleteVault(config = loadSyncConfig()): Promise<void> {
  if (!config) return
  const parts = parseRecoveryCode(config.recoveryCode)
  await api(`/api/vaults/${parts.vaultId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${parts.authToken}` },
  })
  saveSyncConfig(null)
}

let syncTimer: number | undefined
export function scheduleCloudBackup(state: AppState): void {
  if (!loadSyncConfig()) return
  window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(() => {
    void updateVault(state).catch((error: unknown) => {
      window.dispatchEvent(new CustomEvent('cloud-sync-error', { detail: error instanceof Error ? error.message : 'Cloud backup failed.' }))
    })
  }, 1800)
}
