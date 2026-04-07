"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Prompt, PromptHistoryItem, SuggestionId } from "../page"
import { PromptButton } from "./PromptButton"
import { StackedPromptTabBar } from "./StackedPromptTabBar"
import { ChatBetaHeader } from "./ChatBetaHeader"
import { StreamingTypewriter } from "../../components/StreamingTypewriter"
import { portfolioKnowledge } from "@/content/portfolio-knowledge"

interface ResponseStateProps {
  prompts: Prompt[]
  currentPromptId: SuggestionId | null
  availableSuggestions: Prompt[]
  allSuggestions: Prompt[]
  onPromptClick: (promptId: SuggestionId) => void
  onSuggestionSelect: (suggestion: Prompt) => void
  inputError?: string | null
  streamedResponse: string
  isStreaming: boolean
  streamError?: string | null
  promptHistory: PromptHistoryItem[]
  currentHistoryId: string | null
  onHistoryItemClick: (id: string) => void
}

const numberToSuggestionId: Record<string, SuggestionId> = {
  "1": "tell-me-about-yourself",
  "2": "what-are-you-working-on",
  "3": "can-i-see-your-resume",
  "4": "examples-of-work",
  "5": "exit-chat",
}

// SVG icon shared by all action buttons
function ExternalLinkIcon() {
  return (
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
      className="mr-3"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  )
}

export function ResponseState({
  prompts,
  currentPromptId,
  availableSuggestions,
  allSuggestions,
  onPromptClick,
  onSuggestionSelect,
  inputError,
  streamedResponse,
  isStreaming,
  streamError,
  promptHistory,
  currentHistoryId,
  onHistoryItemClick,
}: ResponseStateProps) {
  const promptBarRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isResponseComplete, setIsResponseComplete] = useState(false)
  const [showScrollArrow, setShowScrollArrow] = useState(false)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const collapseHistoryRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (streamedResponse === "") {
      setIsResponseComplete(false)
    }
  }, [streamedResponse])

  useEffect(() => {
    if (isStreaming) {
      setIsResponseComplete(false)
    }
  }, [isStreaming])

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

  const playAudio = () => {
    if (audioRef.current) {
      const clone = audioRef.current.cloneNode() as HTMLAudioElement
      clone.volume = audioRef.current.volume
      clone.play().catch((err) => console.log("Audio play failed:", err))
    }
  }

  const handleSuggestionClick = (suggestion: Prompt) => {
    playAudio()
    onSuggestionSelect(suggestion)
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
          const suggestion =
            availableSuggestions.find((s) => s.id === suggestionId) ||
            allSuggestions.find((s) => s.id === suggestionId)
          if (suggestion) {
            event.preventDefault()
            playAudio()
            onSuggestionSelect(suggestion)
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [availableSuggestions, allSuggestions, onSuggestionSelect])

  // Scroll active tab into view
  useEffect(() => {
    if (promptBarRef.current && currentPromptId) {
      const selected = promptBarRef.current.querySelector(
        `[data-prompt-id="${currentPromptId}"]`
      ) as HTMLElement | null
      selected?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [currentPromptId])

  // Scroll arrow logic
  const checkScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 50)
    }
  }, [])

  const handleScroll = useCallback(() => {
    setShowScrollArrow(false)
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(checkScrollPosition, 5000)
  }, [checkScrollPosition])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    checkScrollPosition()
    container.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", checkScrollPosition)
    if (isResponseComplete) setTimeout(checkScrollPosition, 100)
    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkScrollPosition)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [checkScrollPosition, handleScroll, isResponseComplete])

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }

  // ── Action button visibility ────────────────────────────────────────────────

  // Resume button — shown after "can I see your resume?"
  const showResumeButton =
    currentPromptId === "can-i-see-your-resume" && isResponseComplete

  // LinkedIn / contact buttons — shown after "what are you working on?"
  const showContactButtons =
    currentPromptId === "what-are-you-working-on" && isResponseComplete

  // Project buttons — shown after "examples of work"
  const showExamplesButtons =
    currentPromptId === "examples-of-work" && isResponseComplete

  // ── Dynamic mention detection ───────────────────────────────────────────────
  // For free-text responses: if the AI mentions a project by keyword, surface
  // that project's button automatically. Driven entirely by portfolio-knowledge.ts.
  const lowerResponse = streamedResponse.toLowerCase()

  const mentionedProjects = isResponseComplete && !showExamplesButtons
    ? portfolioKnowledge.actions.projects.filter((project) =>
        project.mentionKeywords.some((kw) => lowerResponse.includes(kw))
      )
    : []

  const hasDynamicButtons = mentionedProjects.length > 0

  // ── Error / response display ────────────────────────────────────────────────
  const hasError = !!(inputError || streamError)
  const errorMessage = streamError || inputError

  // Shared button class
  const actionBtnClass =
    "inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-3xl px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-all duration-200"

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-[612px] md:min-h-[80vh] w-full overflow-y-auto chat-scrollbar relative"
    >
      {/* Beta Header */}
      <ChatBetaHeader />

      {/* Stacked Prompt Tab Bar */}
      <div className="sticky top-0 z-20 relative w-full mb-3">
        <StackedPromptTabBar
          promptHistory={promptHistory}
          currentHistoryId={currentHistoryId}
          onHistoryItemClick={onHistoryItemClick}
          onExpandChange={setIsHistoryExpanded}
          collapseRef={collapseHistoryRef}
        />
      </div>

      {/* Response Content Area */}
      <div className="flex-1 py-0 mt-2 w-full relative">
        {/* Tap-to-close overlay when history panel is expanded */}
        {isHistoryExpanded && (
          <div
            className="absolute inset-0 z-10 bg-black/75 rounded-lg cursor-default"
            onClick={() => collapseHistoryRef.current?.()}
            aria-hidden="true"
          />
        )}

        <div className="flex flex-col items-start w-full">

          {/* Error state */}
          {hasError ? (
            <p className="font-light leading-[28px] text-xl text-red-400 dark:text-red-400 w-full">
              {errorMessage}
            </p>
          ) : (
            <>
              {/* AI streaming response */}
              {(streamedResponse || isStreaming) && (
                <p className="font-light leading-[28px] text-xl text-gray-400 dark:text-gray-400 w-full whitespace-pre-wrap">
                  <StreamingTypewriter
                    incomingText={streamedResponse}
                    isStreaming={isStreaming}
                    delay={12}
                    onComplete={() => setIsResponseComplete(true)}
                  />
                </p>
              )}

              {/* Loading state (before first chunk arrives) */}
              {isStreaming && streamedResponse === "" && (
                <p className="font-light text-xl text-gray-600 dark:text-gray-600 animate-pulse">
                  Thinking...
                </p>
              )}

              {/* ── Resume button ─────────────────────────────────────────── */}
              {showResumeButton && (
                <div className="mt-6">
                  <a
                    href={portfolioKnowledge.actions.resume.url}
                    download
                    className={actionBtnClass}
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
                      className="mr-3"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4m-8 10v-6m-3 3l3 3l3-3" />
                    </svg>
                    {portfolioKnowledge.actions.resume.label}
                  </a>
                </div>
              )}

              {/* ── Contact / LinkedIn buttons ────────────────────────────── */}
              {showContactButtons && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={portfolioKnowledge.actions.linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={actionBtnClass}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="mr-3"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    {portfolioKnowledge.actions.linkedin.label}
                  </a>
                  <a
                    href={portfolioKnowledge.actions.contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={actionBtnClass}
                  >
                    <ExternalLinkIcon />
                    {portfolioKnowledge.actions.contact.label}
                  </a>
                </div>
              )}

              {/* ── Examples / project buttons ────────────────────────────── */}
              {showExamplesButtons && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {portfolioKnowledge.actions.projects.map((project) => (
                    <a
                      key={project.id}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={actionBtnClass}
                    >
                      <ExternalLinkIcon />
                      {project.label}
                    </a>
                  ))}
                </div>
              )}

              {/* ── Dynamic mention buttons ───────────────────────────────── */}
              {hasDynamicButtons && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {mentionedProjects.map((project) => (
                    <a
                      key={project.id}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={actionBtnClass}
                    >
                      <ExternalLinkIcon />
                      {project.label}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Available Suggestions — shown after response completes */}
        {isResponseComplete && availableSuggestions.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {availableSuggestions.map((suggestion, index) => (
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
      </div>

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
