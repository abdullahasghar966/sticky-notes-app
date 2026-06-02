# state.md — Application State Snapshot

_Last updated: 2026-06-03 · Theme: **Parchment** (light editorial)_

---

## Working directory & file tree
`D:\Internship Task 6`

```
.
├── .claude/
│   └── launch.json            # preview dev-server config (port 5173)
├── .gitignore
├── index.html                 # fonts, color-scheme=light, #root
├── package.json
├── vite.config.js             # react + tailwindcss(v4) plugins
├── claude.md                  # architecture & decisions
├── progress.md                # build log
├── state.md                   # this file
├── public/
│   └── note.svg               # favicon (clay on paper)
└── src/
    ├── main.jsx
    ├── App.jsx                # root wiring
    ├── index.css              # @theme tokens + base + masonry + grain
    ├── components/
    │   ├── Header.jsx
    │   ├── NoteBoard.jsx
    │   ├── NoteCard.jsx
    │   ├── NoteEditor.jsx
    │   ├── DeleteButton.jsx
    │   ├── VoiceButton.jsx
    │   ├── EmptyState.jsx
    │   ├── Toast.jsx
    │   └── icons.jsx
    ├── hooks/
    │   ├── useNotes.js
    │   ├── useVoiceInput.js
    │   └── useLocalStorage.js
    └── utils/
        ├── noteColors.js
        └── storage.js
```
(`node_modules/`, `dist/` are generated and git-ignored.)

---

## Installed dependencies (resolved versions)

**Runtime**
| Package | Version |
|---|---|
| react | 18.3.1 |
| react-dom | 18.3.1 |
| framer-motion | 11.18.2 |
| react-masonry-css | 1.0.16 |
| uuid | 11.1.1 |

**Dev / build**
| Package | Version |
|---|---|
| vite | 6.4.3 |
| @vitejs/plugin-react | 4.7.0 |
| tailwindcss | 4.3.0 |
| @tailwindcss/vite | 4.3.0 |

**Built-in browser APIs:** Web Speech API, localStorage — no install.
**External API keys:** none required.

Toolchain: Node v24.12.0 · npm 11.6.2 · Windows 11 / PowerShell.

---

## Scripts
- `npm run dev` — Vite dev server (HMR), http://localhost:5173
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build

---

## Last verified working state
- `npm run build` → **419 modules, 0 errors, 0 warnings** (≈6 s).
  Output: `index.html` 1.35 kB · CSS 26.1 kB (gzip 5.83) · JS 289.4 kB (gzip 93.9).
- Live preview (Chromium): 8 seeded notes render; masonry **4 columns @1280px**;
  computed styles match Parchment tokens exactly; no console errors.
- Add / edit / delete / Undo / color-pick / keyboard shortcuts: wired & verified
  by interaction-path review.

## localStorage status
- Key: `sticky-notes-app`
- **Populated** in the verification browser with **8 demo notes** (seeded to
  exercise the board). Clear them anytime via each card's delete button, or:
  `localStorage.removeItem('sticky-notes-app')`. A fresh user starts empty
  (→ EmptyState).

---

## Known bugs / TODOs
- **None blocking.** Build is clean; all spec features implemented.
- Sandbox-only (not real-browser) artifacts, documented in `claude.md`:
  preview screenshot times out; CDP resize doesn't refire masonry recalc;
  Fontshare (Clash Display) blocked in-sandbox.
- Optional future work:
  - Migrate notes saved under the previous dark palette to the nearest paper
    tone (currently old colors fall back to the first palette entry).
  - Optional hover-pause on toast auto-dismiss.
  - Search / tag / pin, and export-to-JSON.
