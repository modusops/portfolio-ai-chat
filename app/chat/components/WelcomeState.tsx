"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Prompt, SuggestionId } from "../page"
import { TypewriterText } from "../../components/TypewriterText"
import { ChatBetaHeader } from "./ChatBetaHeader"
import { portfolioKnowledge } from "@/content/portfolio-knowledge"

interface WelcomeStateProps {
  suggestions: Prompt[]
  onSuggestionSelect: (suggestion: Prompt) => void
}

const numberToSuggestionId: Record<string, SuggestionId> = {
  "1": "tell-me-about-yourself",
  "2": "what-are-you-working-on",
  "3": "can-i-see-your-resume",
  "4": "examples-of-work",
  "5": "exit-chat",
}

export function WelcomeState({ suggestions, onSuggestionSelect }: WelcomeStateProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollAudioRef = useRef<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showScrollArrow, setShowScrollArrow] = useState(false)
  const pendingScrollAudio = useRef(false)

  // Initialize bong audio
  useEffect(() => {
    const audio = new Audio("/bong_001.ogg")
    audio.preload = "auto"
    audio.volume = 1.0
    audio.load()
    audioRef.current = audio
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Detect user interaction to enable audio
  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteracted(true)
      if (pendingScrollAudio.current && scrollAudioRef.current) {
        scrollAudioRef.current.play().catch((error) => {
          console.log("Scroll audio play failed after interaction:", error)
        })
        pendingScrollAudio.current = false
      }
    }

    const events = ["click", "keydown", "touchstart"]
    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { once: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction)
      })
    }
  }, [])

  // Initialize scroll audio
  useEffect(() => {
    const scrollAudio = new Audio("/scroll_001.ogg")
    scrollAudio.preload = "auto"
    scrollAudio.volume = 1.0
    scrollAudio.loop = true
    scrollAudioRef.current = scrollAudio
    scrollAudio.load()

    return () => {
      if (scrollAudioRef.current) {
        scrollAudioRef.current.pause()
        scrollAudioRef.current = null
      }
    }
  }, [])

  const playAudio = () => {
    if (audioRef.current) {
      const audioClone = audioRef.current.cloneNode() as HTMLAudioElement
      audioClone.volume = audioRef.current.volume
      audioClone.play().catch((error) => {
        console.log("Audio play failed:", error)
      })
    }
  }

  const handleSuggestionClick = (suggestion: Prompt) => {
    playAudio()
    onSuggestionSelect(suggestion)
  }

  const startScrollAudio = useCallback(() => {
    if (scrollAudioRef.current) {
      const audio = scrollAudioRef.current
      audio.currentTime = 0

      if (hasUserInteracted) {
        audio.play().catch((error) => {
          console.log("Scroll audio play failed:", error)
        })
      } else {
        pendingScrollAudio.current = true
      }
    }
  }, [hasUserInteracted])

  const stopScrollAudio = () => {
    if (scrollAudioRef.current) {
      scrollAudioRef.current.pause()
      scrollAudioRef.current.currentTime = 0
    }
  }

  const handleBodyComplete = () => {
    stopScrollAudio()
    setIsTypewriterComplete(true)
  }

  const checkScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 50)
    }
  }, [])

  const handleScroll = useCallback(() => {
    setShowScrollArrow(false)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      checkScrollPosition()
    }, 5000)
  }, [checkScrollPosition])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    checkScrollPosition()
    container.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", checkScrollPosition)

    if (isTypewriterComplete) {
      setTimeout(checkScrollPosition, 100)
    }

    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkScrollPosition)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [checkScrollPosition, handleScroll, isTypewriterComplete])

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  // Keyboard shortcuts (1–5)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (event.key >= "1" && event.key <= "5" && !isInputField) {
        const suggestionId = numberToSuggestionId[event.key]
        if (suggestionId) {
          const suggestion = suggestions.find((s) => s.id === suggestionId)
          if (suggestion) {
            event.preventDefault()
            playAudio()
            onSuggestionSelect(suggestion)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [suggestions, onSuggestionSelect])

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 items-start w-full h-[612px] md:h-auto overflow-y-auto chat-scrollbar relative"
    >
      {/* Beta Header */}
      <ChatBetaHeader />

      {/* Welcome Text */}
      <div className="flex flex-col gap-4 items-start w-full">
        {/* Tagline — edit in content/portfolio-knowledge.ts → meta.tagline */}
        <div className="flex flex-col items-start w-full">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-[200] leading-tight text-white dark:text-white max-w-5xl transition-colors duration-200 font-sans"
            style={{ fontWeight: 200, letterSpacing: "-0.01em" }}
          >
            {portfolioKnowledge.meta.tagline}
          </h1>
        </div>
        {/* Welcome message — edit in content/portfolio-knowledge.ts → meta.welcomeMessage */}
        <div className="flex flex-col items-start w-full">
          <p className="font-light leading-[28px] text-lg text-gray-400 dark:text-gray-400 w-full">
            <TypewriterText
              text={portfolioKnowledge.meta.welcomeMessage}
              delay={15}
              onStart={startScrollAudio}
              onComplete={handleBodyComplete}
            />
          </p>
        </div>
      </div>

      {/* Suggestion Buttons */}
      {isTypewriterComplete && (
        <div className="w-full flex flex-col gap-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className="flex gap-2 items-start w-auto opacity-0 animate-fade-in"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <button
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center p-2.5 rounded-2xl text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <span className="text-xs font-light text-gray-700 dark:text-gray-300 leading-4 whitespace-nowrap">
                  {suggestion.text}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scroll Down Arrow (mobile) */}
      {showScrollArrow && (
        <button
          onClick={scrollToBottom}
          className="sticky bottom-0.5 left-1/2 -translate-x-1/2 z-50 h-10 w-10 rounded-full backdrop-blur-lg backdrop-saturate-150 backdrop-brightness-110 bg-white/20 dark:bg-gray-800/20 border border-gray-700 dark:border-gray-700 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 md:hidden self-center"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300 dark:text-gray-300"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  )
}
