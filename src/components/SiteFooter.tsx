import { Link } from 'react-router-dom'

export const FEEDBACK_EMAIL = 'feedback@pipsplayground.com'

export const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
  "Pip's Playground feedback",
)}&body=${encodeURIComponent(
  'Tell us anything — a game idea, a bug, or what your kid loved!\n\n',
)}`

/** Parent-facing links. Shown on the picker screen and grown-ups area only —
 * never inside games, where little fingers roam. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link to="/whats-new">What's new</Link>
      <span aria-hidden="true">·</span>
      <Link to="/privacy">Privacy</Link>
      <span aria-hidden="true">·</span>
      <a href={FEEDBACK_MAILTO}>Request a game / feedback</a>
    </footer>
  )
}
