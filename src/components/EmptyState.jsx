import { motion } from 'framer-motion'
import { PlusIcon } from './icons'

// ──────────────────────────────────────────────────────────────
// EmptyState — shown when there are no notes. Editorial, not cute:
// a quiet stacked-cards mark that drifts, a strong headline, and a
// single clear action.
// ──────────────────────────────────────────────────────────────
export default function EmptyState({ onNew }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-[52vh] flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-9"
      >
        <svg width="132" height="116" viewBox="0 0 132 116" fill="none" aria-hidden="true">
          {/* back card */}
          <rect
            x="30" y="24" width="78" height="78" rx="6"
            fill="#ece7db" stroke="#ddd5c5" strokeWidth="1.5"
            transform="rotate(-7 69 63)"
          />
          {/* mid card */}
          <rect
            x="24" y="20" width="80" height="80" rx="6"
            fill="#f0ebe1" stroke="#e0d9cb" strokeWidth="1.5"
            transform="rotate(4 64 60)"
          />
          {/* front card */}
          <g transform="rotate(-2 60 56)">
            <rect x="20" y="16" width="84" height="84" rx="6" fill="#f1e1dd" stroke="#e2cdc6" strokeWidth="1.5" />
            <rect x="20" y="16" width="3" height="84" rx="1.5" fill="#b9756a" opacity="0.7" />
            <line x1="34" y1="40" x2="88" y2="40" stroke="#cda99f" strokeWidth="3" strokeLinecap="round" />
            <line x1="34" y1="54" x2="78" y2="54" stroke="#dcc3bb" strokeWidth="3" strokeLinecap="round" />
            <line x1="34" y1="68" x2="84" y2="68" stroke="#dcc3bb" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* accent plus */}
          <g transform="translate(96 78)">
            <circle r="15" fill="#b5452f" />
            <path d="M0 -7V7M-7 0H7" stroke="#f1ede4" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </svg>
      </motion.div>

      <h2 className="font-display text-[28px] font-semibold tracking-tight text-ink">
        Nothing pinned yet
      </h2>
      <p className="mt-3 max-w-[360px] text-[14px] leading-relaxed text-muted">
        Capture a thought by hand or by voice. Everything stays in this browser —
        private by default, and waiting when you return.
      </p>

      <motion.button
        type="button"
        onClick={onNew}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-7 flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-bg transition-colors hover:bg-accent-dim"
      >
        <PlusIcon size={16} />
        Write your first note
      </motion.button>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
        or press <span className="text-muted">N</span>
      </p>
    </motion.div>
  )
}
