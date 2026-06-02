// ──────────────────────────────────────────────────────────────
// noteColors.js — curated, muted editorial palette (Parchment).
// Deliberately NOT neon sticky-yellow. Each tone is a soft paper
// surface paired with a faint matching hairline (edge) and a
// mid-tone accent (glow) for the card's left rule + meta type.
// ──────────────────────────────────────────────────────────────

export const NOTE_COLORS = [
  { id: 'sage', bg: '#e4eadd', edge: '#cfd8c5', glow: '#6f9466' },
  { id: 'blush', bg: '#f1e1dd', edge: '#e2cdc6', glow: '#b9756a' },
  { id: 'sky', bg: '#dce6ec', edge: '#c5d3dc', glow: '#5f88a0' },
  { id: 'butter', bg: '#f1ead6', edge: '#e1d6ba', glow: '#b39a55' },
  { id: 'lilac', bg: '#e7e0ec', edge: '#d4c9dc', glow: '#8a6fa6' },
  { id: 'stone', bg: '#e6e3dc', edge: '#d3cfc4', glow: '#8a8478' },
]

export const DEFAULT_COLOR = NOTE_COLORS[0].bg

// Deterministically cycle the palette by position/count.
export function nextColor(index) {
  return NOTE_COLORS[((index % NOTE_COLORS.length) + NOTE_COLORS.length) % NOTE_COLORS.length].bg
}

// Resolve a stored hex back to its descriptor (for edge/glow styling).
export function colorMeta(bg) {
  return NOTE_COLORS.find((c) => c.bg === bg) ?? NOTE_COLORS[0]
}
