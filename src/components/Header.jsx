import { AnimatePresence, motion } from 'framer-motion'
import { PlusIcon } from './icons'

// Note count with a vertical number-flip whenever it changes.
function AnimatedCount({ count }) {
  return (
    <div className="flex items-baseline gap-1.5 font-mono text-[13px] tracking-wide text-muted">
      <span className="relative inline-flex h-[1.1em] overflow-hidden tabular-nums text-ink">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="block"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>{count === 1 ? 'note' : 'notes'}</span>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Header — editorial masthead: mono eyebrow, display wordmark,
// live note count + primary "New note" action.
// ──────────────────────────────────────────────────────────────
export default function Header({ count, onNew }) {
  return (
    <header className="relative z-10">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
        <span>Sticky notes</span>
        <span className="hidden sm:inline">Local-first · Voice ready</span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-6 border-b border-edge pb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[44px] font-semibold leading-[0.95] tracking-tight text-ink sm:text-[58px]"
          >
            Margin
          </motion.h1>
          <p className="mt-2.5 max-w-[420px] text-[13.5px] leading-relaxed text-muted">
            A quiet place for loose thoughts — typed or spoken, kept on this device.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3.5">
          <AnimatedCount count={count} />
          <motion.button
            type="button"
            onClick={onNew}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-bg transition-colors hover:bg-accent-dim"
          >
            <PlusIcon size={16} strokeWidth={2} />
            New note
          </motion.button>
        </div>
      </div>
    </header>
  )
}
