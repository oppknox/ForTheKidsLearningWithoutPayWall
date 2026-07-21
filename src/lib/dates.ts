/** Local calendar day as YYYY-MM-DD (en-CA). Stable for storage keys. */
export function todayKey(date = new Date()): string {
  return date.toLocaleDateString('en-CA')
}

/** Yesterday’s key in local time. */
export function yesterdayKey(date = new Date()): string {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

/** Keys for the last `n` local calendar days, newest first (includes today). */
export function recentDayKeys(n: number, date = new Date()): string[] {
  const keys: string[] = []
  for (let i = 0; i < n; i++) {
    const d = new Date(date)
    d.setDate(d.getDate() - i)
    keys.push(todayKey(d))
  }
  return keys
}
