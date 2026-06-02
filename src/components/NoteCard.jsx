import { useState } from 'react'
import { motion } from 'framer-motion'
import DeleteButton from './DeleteButton'
import { colorMeta } from '../utils/noteColors'

// Coarse pointers (touch) can't hover — reveal delete affordance softly.
const COARSE =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(hover: none)').matches
    : false

function relativeTime(iso) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const min = Math.round((Date.now() - then) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ──────────────────────────────────────────────────────────────
// NoteCard — three nested motion layers, each with ONE concern:
//   • outer  → layout (smooth masonry reflow on add/delete)
//   • middle → scroll-triggered / staggered entrance (whileInView)
//   • inner  → hover lift + self-controlled exit animation
//
// Self-exit (vs AnimatePresence) is deliberate: react-masonry-css
// distributes children into column wrappers, so a top-level
// AnimatePresence can't track per-card exits. The card animates
// itself out, then calls onDelete to unmount + trigger reflow.
// ──────────────────────────────────────────────────────────────
export default function NoteCard({ note, index, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const [exiting, setExiting] = useState(false)
  const meta = colorMeta(note.color)
  const edited = note.updatedAt && note.updatedAt !== note.createdAt
  const revealed = (hovered || COARSE) && !exiting

  const openEditor = () => {
    if (!exiting) onEdit(note)
  }

  return (
    <motion.div layout="position" className="relative">
      {/* MIDDLE — entrance (runs once when scrolled into view) */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{
          type: 'spring',
          stiffness: 220,
          damping: 28,
          delay: Math.min(index, 10) * 0.04,
        }}
      >
        {/* INNER — hover + exit */}
        <motion.article
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onFocusCapture={() => setHovered(true)}
          onBlurCapture={() => setHovered(false)}
          animate={
            exiting
              ? { opacity: 0, scale: 0.85, rotate: -3, y: 6 }
              : { opacity: 1, scale: 1, rotate: 0, y: 0 }
          }
          transition={
            exiting
              ? { duration: 0.24, ease: [0.4, 0, 1, 1] }
              : { type: 'spring', stiffness: 320, damping: 26 }
          }
          whileHover={!exiting ? { y: -3 } : undefined}
          onAnimationComplete={() => {
            if (exiting) onDelete(note)
          }}
          className="group relative cursor-pointer overflow-hidden rounded-[6px] border p-5 pl-6"
          style={{ backgroundColor: note.color, borderColor: meta.edge }}
        >
          {/* left rule in the note's accent */}
          <span
            className="absolute bottom-4 left-0 top-4 w-[2px] rounded-full"
            style={{ backgroundColor: meta.glow, opacity: 0.5 }}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={openEditor}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openEditor()
              }
            }}
            className="outline-none"
          >
            <p className="note-clamp whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink/90">
              {note.content || <span className="text-muted italic">Empty note</span>}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {edited ? 'edited · ' : ''}
                {relativeTime(note.updatedAt || note.createdAt)}
              </span>
              <span
                className="h-2 w-2 rounded-full ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: meta.glow }}
                aria-hidden="true"
              />
            </div>
          </div>

          <DeleteButton revealed={revealed} onConfirm={() => setExiting(true)} />
        </motion.article>
      </motion.div>
    </motion.div>
  )
}
