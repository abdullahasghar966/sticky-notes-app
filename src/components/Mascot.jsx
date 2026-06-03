import { motion, useReducedMotion } from 'framer-motion'

// ──────────────────────────────────────────────────────────────
// Mascot — a playful, original "goggle buddy" that peeks in from the
// page gutter, waves hello, and slides back out. Two instances
// (left + right) are time-offset so they alternate continuously.
//
// • Original artwork (not a trademarked character), drawn as SVG.
// • Only renders where there's genuinely empty space (≥1700px), so it
//   never overlaps the notes; hidden for reduced-motion users.
// • pointer-events: none → never blocks the UI.
// ──────────────────────────────────────────────────────────────

// ── Drop-in real character ────────────────────────────────────
// To use a real (licensed) character image instead of the built-in
// SVG, drop a transparent PNG/WebP into /public and set its path here,
// e.g.  const MASCOT_SRC = '/minion.png'
// Anything truthy renders that image with the same 3D emerge + wave
// motion. Leave empty ('') to use the original built-in mascot.
const MASCOT_SRC = ''

// Width of the centered content column (App <main> max-width) so the
// mascot can emerge from exactly where that column begins.
const COLUMN_WIDTH = 1320

// Angle (deg) the figure folds to when hidden behind the column edge.
const HIDDEN_ANGLE = 92

// The character. Faces forward; its raised (right-hand-side) arm waves.
function Figure() {
  return (
    <svg
      viewBox="0 0 240 360"
      width="100%"
      height="auto"
      role="img"
      aria-label="A friendly waving mascot"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <linearGradient id="m-body" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#ffe24d" />
          <stop offset="1" stopColor="#f1c01c" />
        </linearGradient>
        <radialGradient id="m-hl" cx="0.34" cy="0.26" r="0.55">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="m-denim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f72a6" />
          <stop offset="1" stopColor="#2b5483" />
        </linearGradient>
        <linearGradient id="m-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a8a8a" />
          <stop offset="1" stopColor="#3a3a3a" />
        </linearGradient>
        <radialGradient id="m-lens" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e7e2d4" />
        </radialGradient>
        <clipPath id="m-bodyclip">
          <rect x="55" y="40" width="130" height="250" rx="65" />
        </clipPath>
      </defs>

      {/* contact shadow */}
      <ellipse cx="120" cy="332" rx="66" ry="10" fill="#000000" opacity="0.10" />

      {/* legs (emerge from under the body) */}
      <g fill="#1c1c1c">
        <rect x="92" y="284" width="20" height="32" rx="10" />
        <rect x="128" y="284" width="20" height="32" rx="10" />
        <ellipse cx="97" cy="318" rx="19" ry="9" />
        <ellipse cx="143" cy="318" rx="19" ry="9" />
      </g>

      {/* static arm (left of viewer) — behind body */}
      <path d="M66 178 Q 52 206 53 230" fill="none" stroke="#f1c01c" strokeWidth="21" strokeLinecap="round" />
      <g fill="#1c1c1c">
        <circle cx="53" cy="236" r="13" />
        <rect x="44" y="240" width="7" height="15" rx="3.5" />
        <rect x="52" y="243" width="7" height="15" rx="3.5" />
      </g>

      {/* body */}
      <rect x="55" y="40" width="130" height="250" rx="65" fill="url(#m-body)" />
      <rect x="55" y="40" width="130" height="250" rx="65" fill="url(#m-hl)" />

      {/* hair sprigs */}
      <g stroke="#3a2f20" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M120 42 C 118 26 126 24 124 14" />
        <path d="M107 46 C 103 32 111 28 107 20" />
        <path d="M133 46 C 137 32 129 28 133 20" />
      </g>

      {/* goggle strap */}
      <rect x="49" y="118" width="142" height="34" rx="11" fill="url(#m-metal)" stroke="#2c2c2c" strokeWidth="2" />
      {/* bridge */}
      <rect x="118" y="128" width="24" height="14" rx="4" fill="url(#m-metal)" />

      {/* goggles */}
      {[92, 148].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="135" r="31" fill="url(#m-metal)" stroke="#2a2a2a" strokeWidth="2" />
          <circle cx={cx} cy="135" r="24" fill="#cccccc" />
          <circle cx={cx} cy="135" r="20" fill="url(#m-lens)" />
          <circle cx={cx + 2} cy="137" r="9" fill="#6e4a2a" />
          <circle cx={cx + 2} cy="137" r="4.6" fill="#161616" />
          <circle cx={cx - 1} cy="133" r="2.1" fill="#ffffff" />
        </g>
      ))}

      {/* mouth — open, friendly */}
      <path d="M99 188 Q120 195 141 188 Q137 214 120 216 Q103 214 99 188 Z" fill="#5e3a24" />
      <path d="M108 206 Q120 216 132 206 Q120 211 108 206 Z" fill="#c5736b" />

      {/* overalls (clipped to body) */}
      <g clipPath="url(#m-bodyclip)">
        <rect x="40" y="252" width="160" height="60" fill="url(#m-denim)" />
        <path d="M97 252 V224 Q97 219 102 219 H138 Q143 219 143 224 V252 Z" fill="url(#m-denim)" />
        {/* strap stubs */}
        <path d="M101 222 L95 150 L105 150 L110 222 Z" fill="url(#m-denim)" opacity="0.95" />
        <path d="M139 222 L145 150 L135 150 L130 222 Z" fill="url(#m-denim)" opacity="0.95" />
        {/* pocket */}
        <rect x="105" y="230" width="30" height="22" rx="3" fill="#356ba0" stroke="#6f9cca" strokeWidth="1.4" strokeDasharray="3 3" />
      </g>
      {/* brass clips */}
      <g fill="#cfa64e" stroke="#9c7c34" strokeWidth="1.4">
        <rect x="96" y="214" width="11" height="11" rx="2.5" />
        <rect x="133" y="214" width="11" height="11" rx="2.5" />
      </g>

      {/* waving arm (raised, right of viewer) — pivots at the shoulder */}
      <motion.g
        style={{ transformBox: 'view-box', transformOrigin: '176px 174px' }}
        animate={{ rotate: [-7, 13, -7] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M176 174 Q 202 150 208 114" fill="none" stroke="#f1c01c" strokeWidth="21" strokeLinecap="round" />
        <g fill="#1c1c1c">
          <circle cx="210" cy="106" r="13" />
          <rect x="201" y="84" width="6.5" height="22" rx="3.2" />
          <rect x="209" y="82" width="6.5" height="24" rx="3.2" />
          <rect x="217" y="86" width="6.5" height="20" rx="3.2" />
          <rect x="196" y="98" width="6.5" height="15" rx="3.2" transform="rotate(-28 199 105)" />
        </g>
      </motion.g>
    </svg>
  )
}

// A small "Hi!" bubble that rides along with the figure.
function HiBubble({ isLeft }) {
  return (
    <motion.div
      className="absolute top-[6%] rounded-2xl border border-edge bg-surface px-3 py-1.5 shadow-lg shadow-black/10"
      style={isLeft ? { right: '4%' } : { left: '4%' }}
      animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="font-display text-[15px] font-semibold text-ink">Hi!</span>
      <span
        className="absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-edge bg-surface"
        style={isLeft ? { right: '18%' } : { left: '18%' }}
      />
    </motion.div>
  )
}

// Character art — licensed image if provided, else the built-in SVG.
// The right-side instance is mirrored so it always faces/waves inward.
function Character({ isLeft }) {
  return (
    <div style={{ transform: isLeft ? undefined : 'scaleX(-1)' }}>
      {MASCOT_SRC ? (
        <img src={MASCOT_SRC} alt="" draggable="false" className="block w-full select-none" />
      ) : (
        <Figure />
      )}
    </div>
  )
}

export default function Mascot({ side = 'left' }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  const isLeft = side === 'left'
  const hidden = isLeft ? HIDDEN_ANGLE : -HIDDEN_ANGLE

  // The figure is hinged at the column edge and swings out in 3D from
  // behind it (rotateY: hidden → 0 → hidden) + a slight depth scale.
  // Left fills the first half of the 7s loop, right the second, so the
  // two alternate with a ~3.5s gap.
  const anim = isLeft
    ? {
        rotateY: [hidden, 0, 0, hidden, hidden],
        scale: [0.9, 1, 1, 0.9, 0.9],
        times: [0, 0.11, 0.34, 0.42, 1],
      }
    : {
        rotateY: [hidden, hidden, 0, 0, hidden, hidden],
        scale: [0.9, 0.9, 1, 1, 0.9, 0.9],
        times: [0, 0.5, 0.61, 0.84, 0.92, 1],
      }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-y-0 z-30 hidden items-center overflow-hidden min-[1700px]:flex ${
        isLeft ? 'left-0 justify-end' : 'right-0 justify-start'
      }`}
      style={{
        width: `max(0px, calc((100vw - ${COLUMN_WIDTH}px) / 2))`,
        perspective: '1200px',
      }}
    >
      <motion.div
        className="relative"
        style={{
          width: 'min(320px, 100%)',
          transformOrigin: isLeft ? 'right center' : 'left center',
        }}
        initial={{ rotateY: hidden, scale: 0.9 }}
        animate={{ rotateY: anim.rotateY, scale: anim.scale }}
        transition={{ duration: 7, times: anim.times, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Character isLeft={isLeft} />
        <HiBubble isLeft={isLeft} />
      </motion.div>
    </div>
  )
}
