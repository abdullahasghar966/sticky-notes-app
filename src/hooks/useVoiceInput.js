import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ──────────────────────────────────────────────────────────────
// useVoiceInput — thin abstraction over the Web Speech API.
//
// Returns: { isSupported, status, interim, error, start, stop, reset }
//   status: 'idle' | 'listening' | 'processing' | 'error'
//   interim: live (non-final) transcript, shown muted while speaking
//
// Final transcripts are pushed to the onFinal callback so the caller
// can append them to whatever field is being edited.
// ──────────────────────────────────────────────────────────────
function getEngine() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useVoiceInput({ lang = 'en-US', onFinal } = {}) {
  const Engine = useMemo(getEngine, [])
  const isSupported = !!Engine

  const [status, setStatus] = useState('idle')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')

  const recognitionRef = useRef(null)
  // Keep the latest onFinal without re-creating the recognition instance.
  const onFinalRef = useRef(onFinal)
  onFinalRef.current = onFinal

  useEffect(() => {
    if (!isSupported) return undefined

    const rec = new Engine()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = lang

    rec.onstart = () => {
      setError('')
      setStatus('listening')
    }

    rec.onresult = (event) => {
      let interimText = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript
        if (event.results[i].isFinal) finalText += chunk
        else interimText += chunk
      }
      if (finalText) {
        setStatus('processing')
        setInterim('')
        onFinalRef.current?.(finalText)
      } else {
        setStatus('listening')
        setInterim(interimText)
      }
    }

    rec.onerror = (event) => {
      // Programmatic aborts (cleanup / manual stop) aren't user-facing errors.
      if (event.error === 'aborted') return
      setStatus('error')
      setError(mapError(event.error))
    }

    rec.onend = () => {
      setInterim('')
      setStatus((s) => (s === 'error' ? 'error' : 'idle'))
    }

    recognitionRef.current = rec
    return () => {
      rec.onstart = rec.onresult = rec.onerror = rec.onend = null
      try {
        rec.abort()
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null
    }
  }, [Engine, isSupported, lang])

  const start = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    setError('')
    try {
      rec.start()
    } catch {
      // .start() throws if already running — safe to ignore.
    }
  }, [])

  const stop = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      rec.stop()
    } catch {
      /* no-op */
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError('')
    setInterim('')
  }, [])

  return { isSupported, status, interim, error, start, stop, reset }
}

function mapError(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access denied. Enable it in browser settings.'
    case 'no-speech':
      return "Didn't catch that — try again."
    case 'audio-capture':
      return 'No microphone found.'
    case 'network':
      return 'Network error during recognition.'
    default:
      return 'Voice input failed. Try again.'
  }
}
