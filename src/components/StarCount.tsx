/** Clean star total — never a long emoji garland. */
export function StarCount({
  stars,
  label = 'You earned',
  className = 'finish-stars',
}: {
  stars: number
  label?: string
  className?: string
}) {
  const n = Math.max(0, Math.floor(stars))
  return (
    <p className={className} aria-label={`${label} ${n} stars`}>
      <span className="star-count-label">{label}</span>{' '}
      <span className="star-count-badge">
        <span aria-hidden="true">⭐</span>
        <strong>{n}</strong>
      </span>
    </p>
  )
}
