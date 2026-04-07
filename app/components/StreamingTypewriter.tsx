"use client"

import { useEffect, useRef, useState } from "react"

/**
 * StreamingTypewriter
 *
 * Renders incoming streamed text character-by-character, creating a smooth
 * typewriter effect driven by the real API stream rather than a static string.
 *
 * - `incomingText` grows as the stream delivers new chunks.
 * - An internal queue tracks how many characters have been "scheduled".
 * - A recurring timer reveals one character per `delay` ms from the queue.
 * - When the stream ends (`isStreaming` becomes false) and all characters
 *   have been displayed, `onComplete` is called.
 */
interface StreamingTypewriterProps {
  incomingText: string
  isStreaming: boolean
  delay?: number
  onComplete?: () => void
  showCursor?: boolean
  className?: string
}

export function StreamingTypewriter({
  incomingText,
  isStreaming,
  delay = 12,
  onComplete,
  showCursor = true,
  className = "",
}: StreamingTypewriterProps) {
  const [displayCount, setDisplayCount] = useState(0)
  const displayCountRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  const hasCalledCompleteRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (incomingText === "") {
      setDisplayCount(0)
      displayCountRef.current = 0
      hasCalledCompleteRef.current = false
    }
  }, [incomingText])

  useEffect(() => {
    function tick() {
      const current = displayCountRef.current
      const total = incomingText.length

      if (current < total) {
        const next = current + 1
        displayCountRef.current = next
        setDisplayCount(next)
        timerRef.current = setTimeout(tick, delay)
      } else if (!isStreaming) {
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          onCompleteRef.current?.()
        }
      }
    }

    if (displayCountRef.current < incomingText.length) {
      timerRef.current = setTimeout(tick, delay)
    } else if (!isStreaming && incomingText.length > 0) {
      if (!hasCalledCompleteRef.current) {
        hasCalledCompleteRef.current = true
        onCompleteRef.current?.()
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingText, isStreaming, delay])

  const displayText = incomingText.slice(0, displayCount)
  const showBlinkingCursor =
    showCursor && (isStreaming || displayCount < incomingText.length)

  return (
    <span className={className}>
      {displayText}
      {showBlinkingCursor && <span className="animate-blink"> ▊</span>}
    </span>
  )
}
