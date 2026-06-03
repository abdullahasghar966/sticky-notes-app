import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UndoIcon } from './icons'

const ACCENT = {
  success: 'var(--color-accent)',
  delete: 'var(--color-muted)',
  error: 'var(--color-danger)',
}

// Single toast: enters from bottom-right, auto-dismisses, shows a
// shrinking progress bar for the (undo) window, optional action.
function Toast({ toast, onDismiss }) {
  const { id, type = 'success', message, action, duration = 3000 } = toast

  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(id), duration)
    return () => window.clearTimeout(t)
  }, [id, duration, onDismiss])

  const accent = ACCENT[type] ?? ACCENT.success

  return (
    <motion.div
      initial={{ opacity: 0, x: 28, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 28, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="pointer-events-auto relative w-full overflow-hidden rounded-[8px] border border-edge bg-surface/95 shadow-lg shadow-black/10 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        <span className="flex-1 text-[13px] text-ink/90">{message}</span>

        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick()
              onDismiss(id)
            }}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-accent transition-colors hover:bg-accent/10"
          >
            <UndoIcon size={13} />
            {action.label}
          </button>
        )}
      </div>

      {/* Auto-dismiss progress */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        style={{ backgroundColor: accent, transformOrigin: 'left', width: '100%' }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

// Bottom-right stack.
export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[60] flex w-full max-w-[360px] flex-col items-end gap-2.5 p-4 sm:p-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
