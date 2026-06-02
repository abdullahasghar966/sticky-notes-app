import { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { useLocalStorage } from './useLocalStorage'
import { nextColor } from '../utils/noteColors'

// ──────────────────────────────────────────────────────────────
// useNotes — note CRUD layered on the generic persistence hook.
// Every mutation flows through setNotes, so localStorage stays in
// sync automatically (handled inside useLocalStorage).
//
// Note shape:
//   { id, content, color, createdAt, updatedAt }
// ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sticky-notes-app'

export function useNotes() {
  const [notes, setNotes, { available }] = useLocalStorage(STORAGE_KEY, [])

  // Create. Newest first. Auto-cycles color when none supplied.
  const addNote = useCallback(
    ({ content = '', color } = {}) => {
      const now = new Date().toISOString()
      const note = {
        id: uuid(),
        content: content.trim(),
        color: color || nextColor(notes.length),
        createdAt: now,
        updatedAt: now,
      }
      setNotes((prev) => [note, ...prev])
      return note
    },
    [notes.length, setNotes],
  )

  // Patch content/color and bump updatedAt.
  const updateNote = useCallback(
    (id, patch = {}) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n
          const content =
            typeof patch.content === 'string' ? patch.content.trim() : n.content
          return { ...n, ...patch, content, updatedAt: new Date().toISOString() }
        }),
      )
    },
    [setNotes],
  )

  // Delete. Returns the removed note + its index so the caller can offer Undo.
  const deleteNote = useCallback(
    (id) => {
      const index = notes.findIndex((n) => n.id === id)
      const note = index >= 0 ? notes[index] : null
      setNotes((prev) => prev.filter((n) => n.id !== id))
      return { note, index }
    },
    [notes, setNotes],
  )

  // Restore a previously deleted note at its original position (Undo).
  const restoreNote = useCallback(
    (note, index = 0) => {
      if (!note) return
      setNotes((prev) => {
        if (prev.some((n) => n.id === note.id)) return prev
        const copy = [...prev]
        copy.splice(Math.min(Math.max(index, 0), copy.length), 0, note)
        return copy
      })
    },
    [setNotes],
  )

  return {
    notes,
    count: notes.length,
    addNote,
    updateNote,
    deleteNote,
    restoreNote,
    storageAvailable: available,
  }
}
