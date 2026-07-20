export type MascotMood = 'idle' | 'happy' | 'thinking' | 'celebrate'

interface Props {
  mood?: MascotMood
  size?: number
}

/** Pip the fox — the site's guide. Pure SVG, mood drives CSS animation + face. */
export function Mascot({ mood = 'idle', size = 120 }: Props) {
  const bigSmile = mood === 'happy' || mood === 'celebrate'
  return (
    <div className={`mascot ${mood}`} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* tail */}
        <ellipse cx="98" cy="92" rx="18" ry="10" fill="#f4813f" transform="rotate(-30 98 92)" />
        <ellipse cx="106" cy="86" rx="7" ry="5" fill="#fff" transform="rotate(-30 106 86)" />
        {/* ears */}
        <polygon points="30,38 40,8 54,34" fill="#f4813f" />
        <polygon points="90,38 80,8 66,34" fill="#f4813f" />
        <polygon points="35,34 41,16 50,32" fill="#5e3a1e" />
        <polygon points="85,34 79,16 70,32" fill="#5e3a1e" />
        {/* body */}
        <ellipse cx="60" cy="94" rx="30" ry="22" fill="#f4813f" />
        <ellipse cx="60" cy="100" rx="18" ry="14" fill="#fff" />
        {/* head */}
        <circle cx="60" cy="52" r="32" fill="#f4813f" />
        {/* muzzle */}
        <ellipse cx="60" cy="64" rx="16" ry="12" fill="#fff" />
        {/* eyes */}
        {mood === 'thinking' ? (
          <>
            <path d="M42 46 q6 -6 12 0" stroke="#3a3450" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M66 46 q6 -6 12 0" stroke="#3a3450" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="48" cy="46" r="5" fill="#3a3450" />
            <circle cx="72" cy="46" r="5" fill="#3a3450" />
            <circle cx="50" cy="44" r="1.8" fill="#fff" />
            <circle cx="74" cy="44" r="1.8" fill="#fff" />
          </>
        )}
        {/* nose + mouth */}
        <ellipse cx="60" cy="60" rx="4.5" ry="3.5" fill="#5e3a1e" />
        {bigSmile ? (
          <path d="M50 66 q10 12 20 0" stroke="#5e3a1e" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M53 68 q7 5 14 0" stroke="#5e3a1e" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {/* cheeks */}
        <circle cx="36" cy="58" r="5" fill="#ffb28a" opacity="0.8" />
        <circle cx="84" cy="58" r="5" fill="#ffb28a" opacity="0.8" />
      </svg>
    </div>
  )
}
