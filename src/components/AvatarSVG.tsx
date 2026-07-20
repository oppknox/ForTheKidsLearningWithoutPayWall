import type { AvatarConfig } from '../types'

interface Props {
  config: AvatarConfig
  size?: number
}

/** A kid's buildable avatar: creature shape + body color + accessory. */
export function AvatarSVG({ config, size = 96 }: Props) {
  const { creature, color, accessory } = config
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {/* creature-specific bits behind the head */}
      {creature === 'fox' && (
        <>
          <polygon points="22,34 30,6 44,28" fill={color} />
          <polygon points="78,34 70,6 56,28" fill={color} />
        </>
      )}
      {creature === 'cat' && (
        <>
          <polygon points="24,32 28,8 46,24" fill={color} />
          <polygon points="76,32 72,8 54,24" fill={color} />
        </>
      )}
      {creature === 'panda' && (
        <>
          <circle cx="28" cy="24" r="12" fill="#3a3450" />
          <circle cx="72" cy="24" r="12" fill="#3a3450" />
        </>
      )}
      {creature === 'frog' && (
        <>
          <circle cx="32" cy="20" r="12" fill={color} />
          <circle cx="68" cy="20" r="12" fill={color} />
          <circle cx="32" cy="18" r="6" fill="#fff" />
          <circle cx="68" cy="18" r="6" fill="#fff" />
          <circle cx="32" cy="18" r="3" fill="#3a3450" />
          <circle cx="68" cy="18" r="3" fill="#3a3450" />
        </>
      )}
      {creature === 'dino' && (
        <>
          <polygon points="35,14 42,2 49,14" fill="#fff" />
          <polygon points="50,12 57,0 64,12" fill="#fff" />
          <polygon points="65,16 72,6 79,18" fill="#fff" />
        </>
      )}
      {creature === 'robot' && (
        <>
          <rect x="47" y="2" width="6" height="14" rx="3" fill="#9aa4b2" />
          <circle cx="50" cy="4" r="5" fill="#ffc93c" />
        </>
      )}

      {/* head */}
      {creature === 'robot' ? (
        <rect x="18" y="16" width="64" height="64" rx="14" fill={color} />
      ) : (
        <circle cx="50" cy="50" r="34" fill={color} />
      )}

      {/* panda eye patches */}
      {creature === 'panda' && (
        <>
          <ellipse cx="38" cy="46" rx="9" ry="11" fill="#3a3450" transform="rotate(-15 38 46)" />
          <ellipse cx="62" cy="46" rx="9" ry="11" fill="#3a3450" transform="rotate(15 62 46)" />
        </>
      )}

      {/* face (frog eyes are on stalks above) */}
      {creature !== 'frog' && (
        <>
          <circle cx="38" cy="46" r="5" fill={creature === 'panda' ? '#fff' : '#3a3450'} />
          <circle cx="62" cy="46" r="5" fill={creature === 'panda' ? '#fff' : '#3a3450'} />
          {creature === 'panda' && (
            <>
              <circle cx="38" cy="46" r="2.5" fill="#3a3450" />
              <circle cx="62" cy="46" r="2.5" fill="#3a3450" />
            </>
          )}
        </>
      )}
      <path d="M40 62 q10 10 20 0" stroke="#3a3450" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {creature !== 'robot' && creature !== 'panda' && (
        <>
          <circle cx="28" cy="58" r="5" fill="#ffffff" opacity="0.35" />
          <circle cx="72" cy="58" r="5" fill="#ffffff" opacity="0.35" />
        </>
      )}

      {/* accessory */}
      {accessory === 'bow' && (
        <g transform="translate(50 16)">
          <polygon points="-14,-6 0,0 -14,6" fill="#ff5f9e" />
          <polygon points="14,-6 0,0 14,6" fill="#ff5f9e" />
          <circle cx="0" cy="0" r="4" fill="#d63e7c" />
        </g>
      )}
      {accessory === 'cap' && (
        <g>
          <path d="M26 24 a24 18 0 0 1 48 0 z" fill="#2aa7de" />
          <rect x="50" y="18" width="30" height="7" rx="3.5" fill="#1b6fa8" />
        </g>
      )}
      {accessory === 'glasses' && (
        <g stroke="#3a3450" strokeWidth="3" fill="none">
          <circle cx="38" cy="46" r="10" />
          <circle cx="62" cy="46" r="10" />
          <line x1="48" y1="46" x2="52" y2="46" />
        </g>
      )}
      {accessory === 'crown' && (
        <g transform="translate(50 14)">
          <polygon points="-16,6 -16,-6 -8,0 0,-10 8,0 16,-6 16,6" fill="#ffc93c" stroke="#e2a500" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  )
}
