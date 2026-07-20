import { validateFeedback } from './validateFeedback'

const MAX_BODY_BYTES = 300_000
const ID_PATTERN = /^[A-Za-z0-9_-]{16,32}$/
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{40,48}$/

interface VaultRow {
  ciphertext: string
  iv: string
  version: number
  updated_at: number
  auth_hash: string
}

interface VaultBody {
  authHash?: string
  ciphertext?: string
  iv?: string
  expectedVersion?: number
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  const bytes = new Uint8Array(digest)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return difference === 0
}

async function readBody(request: Request): Promise<VaultBody | null> {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) return null
  try {
    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) return null
    const parsed: unknown = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null ? parsed as VaultBody : null
  } catch {
    return null
  }
}

async function authenticate(request: Request, storedHash: string): Promise<boolean> {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return false
  const token = header.slice(7)
  if (!TOKEN_PATTERN.test(token)) return false
  const presentedHash = await sha256Base64Url(token)
  return safeEqual(presentedHash, storedHash)
}

async function handleVault(request: Request, env: Env, id: string): Promise<Response> {
  if (!ID_PATTERN.test(id)) return json({ error: 'Invalid vault ID.' }, 400)

  if (request.method === 'POST') {
    const body = await readBody(request)
    if (!body?.authHash || !body.ciphertext || !body.iv || !TOKEN_PATTERN.test(body.authHash)) {
      return json({ error: 'Invalid vault data.' }, 400)
    }
    if (body.ciphertext.length > 250_000 || body.iv.length > 32) return json({ error: 'Vault is too large.' }, 413)
    const now = Date.now()
    try {
      await env.DB.prepare(
        'INSERT INTO family_vaults (id, auth_hash, ciphertext, iv, version, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, 1, ?5, ?5)',
      ).bind(id, body.authHash, body.ciphertext, body.iv, now).run()
      return json({ version: 1, updatedAt: now }, 201)
    } catch {
      return json({ error: 'That vault already exists.' }, 409)
    }
  }

  const row = await env.DB.prepare(
    'SELECT ciphertext, iv, version, updated_at, auth_hash FROM family_vaults WHERE id = ?1',
  ).bind(id).first<VaultRow>()
  if (!row) return json({ error: 'Vault not found.' }, 404)
  if (!(await authenticate(request, row.auth_hash))) return json({ error: 'Recovery code not accepted.' }, 401)

  if (request.method === 'GET') {
    return json({ ciphertext: row.ciphertext, iv: row.iv, version: row.version, updatedAt: row.updated_at })
  }

  if (request.method === 'PUT') {
    const body = await readBody(request)
    if (!body?.ciphertext || !body.iv || !Number.isInteger(body.expectedVersion)) {
      return json({ error: 'Invalid vault update.' }, 400)
    }
    if (body.ciphertext.length > 250_000 || body.iv.length > 32) return json({ error: 'Vault is too large.' }, 413)
    const now = Date.now()
    const result = await env.DB.prepare(
      'UPDATE family_vaults SET ciphertext = ?1, iv = ?2, version = version + 1, updated_at = ?3 WHERE id = ?4 AND version = ?5',
    ).bind(body.ciphertext, body.iv, now, id, body.expectedVersion).run()
    if (!result.meta.changes) return json({ error: 'A newer backup exists.', currentVersion: row.version }, 409)
    return json({ version: body.expectedVersion + 1, updatedAt: now })
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM family_vaults WHERE id = ?1').bind(id).run()
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  }

  return json({ error: 'Method not allowed.' }, 405)
}

async function handleFeedback(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > 10_000) return json({ error: 'Message is too long.' }, 413)

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return json({ error: 'Invalid submission.' }, 400)
  }

  const submission = validateFeedback(raw)
  if (!submission) return json({ error: 'Invalid submission.' }, 400)

  await env.DB.prepare(
    'INSERT INTO feedback (kind, message, contact, created_at) VALUES (?1, ?2, ?3, ?4)',
  ).bind(submission.kind, submission.message, submission.contact, Date.now()).run()

  return json({ ok: true }, 201)
}

export default {
  async fetch(request, env): Promise<Response> {
    try {
      const url = new URL(request.url)
      const match = url.pathname.match(/^\/api\/vaults\/([^/]+)$/)
      if (match) return await handleVault(request, env, match[1])
      if (url.pathname === '/api/feedback') return await handleFeedback(request, env)
      if (url.pathname === '/api/health') return json({ ok: true })
      if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404)
      return env.ASSETS.fetch(request)
    } catch (error) {
      console.error(JSON.stringify({ event: 'request_error', message: error instanceof Error ? error.message : 'Unknown error' }))
      return json({ error: 'Something went wrong.' }, 500)
    }
  },
} satisfies ExportedHandler<Env>
