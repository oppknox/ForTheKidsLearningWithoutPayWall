import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
}

/** Chunky candy-press button — the app's signature control. ≥64px tap target. */
export function BigButton({ color, style, className, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`big-btn ${className ?? ''}`}
      style={color ? { ...style, ['--btn-color' as string]: color } : style}
    />
  )
}
