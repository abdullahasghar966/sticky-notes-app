import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, CloseIcon, TrashIcon } from './icons'

// ──────────────────────────────────────────────────────────────
// DeleteButton — slides in on card hover, then asks for a one-tap
// confirmation before firing onConfirm. Reverts itself after a few
// idle seconds so a stray click never leaves a card "armed".
//
// `revealed` is driven by the parent card's hover/focus state; the
// button stays visible while confirming even if hover is lost.
// ──────────────────────────────────────────────────────────────
export default function DeleteButton({ revealed, onConfirm }) {
  const [confirming, setConfirming] = useState(false)
  const timerRef = useRef(null)

  const show = revealed || confirming

  useEffect(() => {
    if (!confirming) return undefined
    timerRef.current = window.setTimeout(() => setConfirming(false), 2600)
    return () => window.clearTimeout(timerRef.current)
  }, [confirming])

  const stop = (e) => {
    e.stopPropagation()
  }

  return (
    <motion.div
      className="absolute right-2.5 top-2.5 z-10"
      initial={false}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : 8 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{ pointerEvents: show ? 'auto' : 'none' }}
      onClick={stop}
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.14 }}
            className="flex items-center gap-1 rounded-full border border-edge bg-bg/85 p-1 backdrop-blur-sm"
          >
            <span className="px-2 font-mono text-[9px] uppercase tracking-widest text-muted">
              Delete?
            </span>
            <button
              type="button"
              aria-label="Confirm delete"
              onClick={(e) => {
                stop(e)
                onConfirm()
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-danger transition-colors hover:bg-danger/15"
            >
              <CheckIcon size={14} />
            </button>
            <button
              type="button"
              aria-label="Cancel delete"
              onClick={(e) => {
                stop(e)
                setConfirming(false)
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink"
            >
              <CloseIcon size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="trash"
            type="button"
            aria-label="Delete note"
            onClick={(e) => {
              stop(e)
              setConfirming(true)
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.14 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-edge bg-bg/70 text-muted backdrop-blur-sm transition-colors hover:border-danger/50 hover:text-danger"
          >
            <TrashIcon size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
