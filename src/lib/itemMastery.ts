import type { ItemMastery, Profile } from '../types'

export type ItemKind = 'letter' | 'sound' | 'fact' | 'word' | 'count' | 'sum'

export function itemKey(kind: ItemKind, id: string): string {
  return `${kind}:${id}`
}

export function parseItemKey(key: string): { kind: string; id: string } | null {
  const i = key.indexOf(':')
  if (i <= 0) return null
  return { kind: key.slice(0, i), id: key.slice(i + 1) }
}

export function emptyItem(): ItemMastery {
  return { seen: 0, perfect: 0, withHelp: 0, strength: 0 }
}

/**
 * Update mastery after a successful answer.
 * Perfect (0 hints) grows strength fast; heavy help grows slowly so the item stays in rotation.
 */
export function applyItemResult(item: ItemMastery | undefined, hintsUsed: number): ItemMastery {
  const base = item ?? emptyItem()
  const perfect = hintsUsed === 0
  let strength = base.strength
  if (perfect) {
    strength = Math.min(100, strength + 18)
  } else if (hintsUsed === 1) {
    strength = Math.min(100, strength + 8)
  } else {
    // Needed a lot of help — still progress, but stay relatively weak.
    strength = Math.min(100, Math.max(0, strength + 3))
  }
  return {
    seen: base.seen + 1,
    perfect: base.perfect + (perfect ? 1 : 0),
    withHelp: base.withHelp + (perfect ? 0 : 1),
    strength,
  }
}

/** 0–1 score for “how much should we prefer this item?” Higher = weaker = more practice. */
export function weaknessScore(item: ItemMastery | undefined): number {
  if (!item || item.seen === 0) return 1
  return 1 - item.strength / 100
}

/**
 * Prefer unseen / weak items among candidates. `candidates` are bare ids (e.g. "B", "3x4").
 * Skips ids in `recentIds` when alternatives exist.
 */
export function pickPreferredId(
  mastery: Record<string, ItemMastery> | undefined,
  kind: ItemKind,
  candidates: string[],
  recentIds: string[] = [],
): string | undefined {
  if (candidates.length === 0) return undefined
  const map = mastery ?? {}
  const fresh = candidates.filter((id) => !recentIds.includes(id))
  const pool = fresh.length > 0 ? fresh : candidates

  let best = pool[0]
  let bestScore = -1
  // Small random jitter so we don't always pick the same weak item.
  for (const id of pool) {
    const score = weaknessScore(map[itemKey(kind, id)]) + Math.random() * 0.15
    if (score > bestScore) {
      bestScore = score
      best = id
    }
  }
  return best
}

/** Cap stored items so localStorage stays lean — drop strongest oldest-ish entries over limit. */
export function pruneItemMastery(
  mastery: Record<string, ItemMastery> | undefined,
  maxItems = 200,
): Record<string, ItemMastery> {
  if (!mastery) return {}
  const entries = Object.entries(mastery)
  if (entries.length <= maxItems) return { ...mastery }
  entries.sort((a, b) => b[1].strength - a[1].strength || b[1].seen - a[1].seen)
  // Keep the weaker / less-seen half of overflow by dropping strongest first.
  const keep = entries.slice(-(maxItems))
  return Object.fromEntries(keep)
}

export function weakItemsFor(
  p: Profile,
  kind?: ItemKind,
  limit = 5,
): { key: string; kind: string; id: string; strength: number }[] {
  const entries = Object.entries(p.itemMastery ?? {})
    .map(([key, m]) => {
      const parsed = parseItemKey(key)
      if (!parsed) return null
      if (kind && parsed.kind !== kind) return null
      return { key, kind: parsed.kind, id: parsed.id, strength: m.strength, seen: m.seen }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.seen > 0)

  return entries
    .sort((a, b) => a.strength - b.strength)
    .slice(0, limit)
    .map(({ key, kind: k, id, strength }) => ({ key, kind: k, id, strength }))
}

export function formatWeakItem(kind: string, id: string): string {
  if (kind === 'fact') return id.replace('x', ' × ')
  if (kind === 'letter' || kind === 'sound') return id.toUpperCase()
  if (kind === 'word') return id.toUpperCase()
  return id
}

/** Human labels for parent dashboard “still growing”. */
export function stillGrowingLabels(p: Profile, limit = 4): string[] {
  return weakItemsFor(p, undefined, limit)
    .filter((w) => w.strength < 70)
    .map((w) => formatWeakItem(w.kind, w.id))
}
