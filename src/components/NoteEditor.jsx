import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { NOTE_COLORS } from '../utils/noteColors'
import VoiceButton from './VoiceButton'
import { CloseIcon } from './icons'

const MAX_CHARS = 1000

function autosize(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

// ──────────────────────────────────────────────────────────────
// NoteEditor — modal for creating / editing a note.
// Mounted inside an <AnimatePresence> by App, so its exit animation
// runs on close. Backdrop blur + spring-scaled panel. The panel body
// is tinted with the live-selected note color as a preview.
// ──────────────────────────────────────────────────────────────
export default function NoteEditor({ editor, onSave, onClose, lang = 'en-US' }) {
  const isEdit = editor.mode === 'edit'
  const [content, setContent] = useState(editor.note?.content ?? '')
  const [color, setColor] = useState(editor.note?.color ?? editor.color)
  const textareaRef = useRef(null)

  const appendTranscript = useCallback((text) => {
    const t = text.trim()
    if (!t) return
    setContent((prev) => {
      const next = prev && !/\s$/.test(prev) ? `${prev} ${t}` : `${prev}${t}`
      return next.slice(0, MAX_CHARS)
    })
    // Return focus to the field after dictation.
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      const len = el.value.length
      el.setSelectionRange(len, len)
      autosize(el)
    })
  }, [])

  const voice = useVoiceInput({ lang, onFinal: appendTranscript })

  const save = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed) return
    onSave({ content: trimmed, color })
  }, [content, color, onSave])

  // Focus textarea, drop cursor at end, size to content — on open.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    const len = el.value.length
    el.setSelectionRange(len, len)
    autosize(el)
  }, [])

  // Grow the field as the value changes (incl. voice input).
  useEffect(() => {
    autosize(textareaRef.current)
  }, [content])

  // Lock background scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Keyboard: Esc closes · Ctrl/Cmd+Enter saves.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        save()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [save, onClose])

  const canSave = content.trim().length > 0

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit note' : 'New note'}
        className="relative flex max-h-[88dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-[10px] border border-edge bg-surface shadow-2xl shadow-black/20"
        variants={{
          hidden: { opacity: 0, scale: 0.96, y: 14 },
          visible: { opacity: 1, scale: 1, y: 0 },
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-edge px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {isEdit ? 'Edit note' : 'New note'}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close editor"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-black/5 hover:text-ink"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Body — tinted with the selected color as a live preview */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: color }}>
          <div className="p-5">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Write something worth keeping…"
              rows={3}
              className="w-full resize-none border-0 bg-transparent text-[15px] leading-relaxed text-ink/95 outline-none placeholder:text-black/30"
              style={{ minHeight: '120px' }}
            />
            {/* Live (interim) speech transcript */}
            {voice.interim && (
              <p className="mt-1 select-none font-sans text-[14px] italic leading-relaxed text-black/45">
                {voice.interim}
              </p>
            )}
          </div>
        </div>

        {/* Color picker + character count */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-edge px-5 py-3">
          <div className="flex items-center gap-1.5" role="group" aria-label="Note color">
            {NOTE_COLORS.map((c) => {
              const active = c.bg === color
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.id}
                  aria-pressed={active}
                  onClick={() => setColor(c.bg)}
                  className="relative flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110"
                >
                  <span
                    className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10"
                    style={{ backgroundColor: c.bg }}
                  />
                  {active && (
                    <motion.span
                      key={c.id}
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{ border: `1.5px solid ${c.glow}` }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
          <span
            className={`font-mono text-[10px] tabular-nums tracking-wide ${
              content.length >= MAX_CHARS ? 'text-danger' : 'text-muted'
            }`}
          >
            {content.length} {content.length === 1 ? 'character' : 'characters'}
          </span>
        </div>

        {/* Footer — voice (left) · actions (right) */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-edge px-5 py-3.5">
          <VoiceButton
            isSupported={voice.isSupported}
            status={voice.status}
            error={voice.error}
            onStart={voice.start}
            onStop={voice.stop}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3.5 py-2 text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="group flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-bg transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isEdit ? 'Save changes' : 'Add note'}
              <kbd className="hidden font-mono text-[10px] font-normal text-bg/60 sm:inline">
                ⌘↵
              </kbd>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
