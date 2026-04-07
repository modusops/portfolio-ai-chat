"use client"

import React, { useEffect, useState, useRef } from "react"

interface TypewriterTextProps {
  text: string
  delay?: number
  className?: string
  style?: React.CSSProperties
  onComplete?: () => void
  onStart?: () => void
  showCursor?: boolean
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 50,
  className = "",
  style = {},
  onComplete,
  onStart,
  showCursor = true,
}) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!hasStartedRef.current && text.length > 0 && onStart) {
      hasStartedRef.current = true
      onStart()
    }
  }, [onStart, text.length])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, delay, text, onComplete])

  return (
    <span className={className} style={style}>
      {displayText}
      {showCursor && <span className="animate-blink"> ▊</span>}
    </span>
  )
}
