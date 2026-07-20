import { Link } from 'react-router-dom'

/** Parent-facing links. Shown on the picker screen and grown-ups area only —
 * never inside games, where little fingers roam. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link to="/whats-new">What's new</Link>
      <span aria-hidden="true">·</span>
      <Link to="/privacy">Privacy</Link>
      <span aria-hidden="true">·</span>
      <Link to="/feedback">Request a game / feedback</Link>
    </footer>
  )
}
