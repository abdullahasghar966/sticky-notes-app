import { AnimatePresence, motion } from 'framer-motion'
import { MicIcon, SpinnerIcon } from './icons'

// ──────────────────────────────────────────────────────────────
// VoiceButton — mic control with four visual states:
//   idle       → mic, gentle hover pulse
//   listening  → red pulsing ring + "Listening…"
//   processing → spinner
//   error      → shake + inline message
//
// When the Web Speech API is unsupported the actionable button is
// hidden and replaced by a muted, tooltip-bearing indicator.
// ──────────────────────────────────────────────────────────────
export default function VoiceButton({ isSupported, status, error, onStart, onStop }) {
  if (!isSupported) {
    return (
      <div className="group/vs relative flex items-center">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border border-edge text-faint"
          aria-disabled="true"
        >
          <MicIcon size={16} />
        </span>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 mb-2 w-max max-w-[200px] rounded-md border border-edge bg-surface px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted opacity-0 shadow-lg transition-opacity duration-150 group-hover/vs:opacity-100"
        >
          Voice not supported in this browser
        </span>
      </div>
    )
  }

  const listening = status === 'listening'
  const processing = status === 'processing'
  const errored = status === 'error'

  const handleClick = () => {
    if (listening) onStop()
    else onStart()
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={handleClick}
        aria-pressed={listening}
        aria-label={listening ? 'Stop voice input' : 'Start voice input'}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: listening ? 'var(--color-danger)' : 'var(--color-edge)',
          color: listening ? 'var(--color-danger)' : 'var(--color-ink)',
          background: listening ? 'rgba(255,77,77,0.08)' : 'transparent',
        }}
        whileHover={!listening ? { scale: 1.06 } : undefined}
        whileTap={{ scale: 0.94 }}
        animate={errored ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
        transition={errored ? { duration: 0.4 } : { type: 'spring', stiffness: 400, damping: 22 }}
      >
        {/* Pulsing rings while listening */}
        <AnimatePresence>
          {listening && (
            <>
              <motion.span
                key="ring-1"
                className="absolute inset-0 rounded-full"
                style={{ border: '1.5px solid var(--color-danger)' }}
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                key="dot"
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(255,77,77,0.12)' }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </AnimatePresence>

        <span className="relative">
          {processing ? (
            <motion.span
              className="block"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            >
              <SpinnerIcon size={16} />
            </motion.span>
          ) : (
            <MicIcon size={16} />
          )}
        </span>
      </motion.button>

      {/* Inline status / error label */}
      <AnimatePresence mode="wait">
        {listening && (
          <motion.span
            key="listening"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-danger"
          >
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-danger"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
            Listening…
          </motion.span>
        )}
        {errored && error && (
          <motion.span
            key="error"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            className="max-w-[220px] font-mono text-[10px] leading-tight tracking-wide text-danger/90"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
