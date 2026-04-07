"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { WelcomeState } from "./components/WelcomeState"
import { ResponseState } from "./components/ResponseState"
import { ExitChatBanner } from "./components/ExitChatBanner"
import { ChatGridBackground } from "./components/ChatGridBackground"

export type SuggestionId =
  | "tell-me-about-yourself"
  | "what-are-you-working-on"
  | "can-i-see-your-resume"
  | "examples-of-work"
  | "exit-chat"

export interface Prompt {
  id: SuggestionId
  text: string
}

/** A single turn in the conversation sent to the API. */
export interface ConversationMessage {
  role: "user" | "assistant"
  content: string
}

/**
 * One entry in the Stacked Prompt Tab Bar history.
 * Stored in newest-first order in the promptHistory state array.
 */
export interface PromptHistoryItem {
  /** Unique id: SuggestionId for preset prompts, timestamp string for free-form. */
  id: string
  /** Short display text shown on the card face. */
  text: string
  /** The full AI response, cached so we can restore it without re-fetching. */
  response: string
  /** When this prompt was submitted. */
  createdAt: Date
  /**
   * Only set for preset prompts — used to restore action buttons when the
   * user navigates back to this history card.
   */
  promptId?: SuggestionId
}

/** Human-readable question text keyed by preset suggestion id. */
const PRESET_QUESTIONS: Record<string, string> = {
  "tell-me-about-yourself": "Tell me about yourself",
  "what-are-you-working-on": "What are you working on now?",
  "can-i-see-your-resume": "Can I see your resume?",
  "examples-of-work": "Let's see some examples of your work",
}

const allSuggestions: Prompt[] = [
  { id: "tell-me-about-yourself", text: "( 1 ) Tell me about yourself" },
  { id: "what-are-you-working-on", text: "( 2 ) What are you working on now?" },
  { id: "can-i-see-your-resume", text: "( 3 ) Can I see your resume?" },
  { id: "examples-of-work", text: "( 4 ) Let's see some examples of your work" },
  { id: "exit-chat", text: "( 5 ) Restart chat" },
]

export default function ChatPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [currentPromptId, setCurrentPromptId] = useState<SuggestionId | null>(null)
  const [isWelcomeState, setIsWelcomeState] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [inputError, setInputError] = useState<string | null>(null)

  // ── AI state ────────────────────────────────────────────────────────────────
  const [streamedResponse, setStreamedResponse] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [tabResponses, setTabResponses] = useState<Partial<Record<SuggestionId, string>>>({})
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])

  // ── Stacked Prompt Tab Bar ───────────────────────────────────────────────────
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([])
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null)

  // ── Audio ────────────────────────────────────────────────────────────────────
  const selectAudioRef = useRef<HTMLAudioElement | null>(null)
  const { setTheme } = useTheme()

  // Force dark mode on chat page
  useEffect(() => {
    setTheme("dark")
    document.documentElement.classList.add("dark")
    document.documentElement.setAttribute("data-theme", "dark")
  }, [setTheme])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Initialise select audio
  useEffect(() => {
    const audio = new Audio("/select_001.ogg")
    audio.preload = "auto"
    audio.volume = 1.0
    audio.load()
    selectAudioRef.current = audio
    return () => {
      if (selectAudioRef.current) {
        selectAudioRef.current.pause()
        selectAudioRef.current = null
      }
    }
  }, [])

  const playSelectAudio = () => {
    if (selectAudioRef.current) {
      const clone = selectAudioRef.current.cloneNode() as HTMLAudioElement
      clone.volume = selectAudioRef.current.volume
      clone.play().catch((err) => console.log("Select audio play failed:", err))
    }
  }

  // ── AI fetch ─────────────────────────────────────────────────────────────────
  const fetchAIResponse = useCallback(
    async (
      message: string,
      options: {
        isPreset: boolean
        promptId?: SuggestionId
        historyId: string
        historyText: string
      }
    ) => {
      setIsStreaming(true)
      setStreamedResponse("")
      setStreamError(null)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history: conversationHistory.slice(-6),
          }),
        })

        if (!response.ok) {
          if (response.status === 429) {
            const data: { message?: string } = await response.json()
            setStreamError(
              data.message ??
                "You've reached the message limit. Please try again later."
            )
            setIsStreaming(false)
            return
          }
          throw new Error(`HTTP ${response.status}`)
        }

        if (!response.body) throw new Error("No response body")

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          setStreamedResponse(fullText)
        }

        setIsStreaming(false)

        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content: message },
          { role: "assistant", content: fullText },
        ])

        if (options.isPreset && options.promptId && options.promptId !== "exit-chat") {
          setTabResponses((prev) => ({ ...prev, [options.promptId!]: fullText }))
        }

        setPromptHistory((prev) => [
          {
            id: options.historyId,
            text: options.historyText,
            response: fullText,
            createdAt: new Date(),
            promptId: options.isPreset ? options.promptId : undefined,
          },
          ...prev,
        ])
        setCurrentHistoryId(options.historyId)
      } catch (err) {
        console.error("AI fetch error:", err)
        setStreamError("Something went wrong. Please try again.")
        setIsStreaming(false)
      }
    },
    [conversationHistory]
  )

  // ── Suggestion / prompt handling ─────────────────────────────────────────────
  const handleSuggestionSelect = useCallback(
    (suggestion: Prompt) => {
      setInputError(null)

      if (suggestion.id === "exit-chat") {
        setPrompts([])
        setCurrentPromptId(null)
        setIsWelcomeState(true)
        setStreamedResponse("")
        setStreamError(null)
        setConversationHistory([])
        setTabResponses({})
        setPromptHistory([])
        setCurrentHistoryId(null)
        return
      }

      setPrompts((prev) => {
        const exists = prev.find((p) => p.id === suggestion.id)
        return exists ? prev : [...prev, suggestion]
      })
      setCurrentPromptId(suggestion.id)
      setIsWelcomeState(false)

      const cached = tabResponses[suggestion.id]
      if (cached) {
        setStreamedResponse(cached)
        setIsStreaming(false)
        setStreamError(null)
        setCurrentHistoryId(suggestion.id)
        return
      }

      const questionText = PRESET_QUESTIONS[suggestion.id] ?? suggestion.text
      fetchAIResponse(questionText, {
        isPreset: true,
        promptId: suggestion.id,
        historyId: suggestion.id,
        historyText: questionText,
      })
    },
    [tabResponses, fetchAIResponse]
  )

  const handlePromptClick = (promptId: SuggestionId) => {
    setInputError(null)
    setCurrentPromptId(promptId)

    const cached = tabResponses[promptId]
    if (cached) {
      setStreamedResponse(cached)
      setIsStreaming(false)
      setStreamError(null)
    }
  }

  const handleHistoryItemClick = useCallback((id: string) => {
    const item = promptHistory.find((h) => h.id === id)
    if (!item) return
    setCurrentHistoryId(id)
    setStreamedResponse(item.response)
    setIsStreaming(false)
    setStreamError(null)
    setCurrentPromptId(item.promptId ?? null)
  }, [promptHistory])

  // ── Input handling ────────────────────────────────────────────────────────────
  const mapInputToPreset = (input: string): SuggestionId | null => {
    const n = input.trim().toLowerCase()
    if (n === "1") return "tell-me-about-yourself"
    if (n === "2") return "what-are-you-working-on"
    if (n === "3") return "can-i-see-your-resume"
    if (n === "4") return "examples-of-work"
    if (n === "5") return "exit-chat"
    if (n === "about") return "tell-me-about-yourself"
    if (n === "resume") return "can-i-see-your-resume"
    if (n === "examples") return "examples-of-work"
    if (n === "restart") return "exit-chat"
    return null
  }

  const handleInputSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isStreaming) return

    setInputError(null)

    const presetId = mapInputToPreset(trimmed)
    if (presetId) {
      const suggestion = allSuggestions.find((s) => s.id === presetId)
      if (suggestion) {
        playSelectAudio()
        setInputValue("")
        handleSuggestionSelect(suggestion)
        return
      }
    }

    playSelectAudio()
    setInputValue("")
    setIsWelcomeState(false)
    setCurrentPromptId(null)
    fetchAIResponse(trimmed, {
      isPreset: false,
      historyId: Date.now().toString(),
      historyText: trimmed,
    })
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputSubmit()
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────────────
  const availableSuggestions = allSuggestions.filter(
    (s) => !prompts.find((p) => p.id === s.id)
  )

  const inputPlaceholder = isWelcomeState
    ? "Ask me anything, or type 1–4 for quick topics"
    : "Ask a follow-up, or type 1–4 for more topics"

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200 flex flex-col items-center justify-center p-4 relative z-10">
      <ChatGridBackground />

      {/* Outer Container */}
      <div className="bg-gray-900 dark:bg-gray-900 flex flex-col gap-2.5 items-center overflow-hidden p-4 rounded-[48px] w-full max-w-2xl relative z-10">

        {/* Content Container */}
        <div className="bg-black dark:bg-black border border-gray-700 dark:border-gray-700 flex flex-col gap-4 grow items-start min-h-0 p-4 rounded-[32px] w-full max-h-[60vh] md:max-h-none overflow-y-auto chat-scrollbar">
          {isWelcomeState ? (
            <WelcomeState
              suggestions={allSuggestions}
              onSuggestionSelect={handleSuggestionSelect}
            />
          ) : (
            <ResponseState
              prompts={prompts}
              currentPromptId={currentPromptId}
              availableSuggestions={availableSuggestions}
              allSuggestions={allSuggestions}
              onPromptClick={handlePromptClick}
              onSuggestionSelect={handleSuggestionSelect}
              inputError={inputError}
              streamedResponse={streamedResponse}
              isStreaming={isStreaming}
              streamError={streamError}
              promptHistory={promptHistory}
              currentHistoryId={currentHistoryId}
              onHistoryItemClick={handleHistoryItemClick}
            />
          )}
        </div>

        {/* Input Field */}
        <div className="relative w-full">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={inputPlaceholder}
            disabled={isStreaming}
            className="bg-black dark:bg-black border border-gray-700 dark:border-gray-700 flex h-12 items-center justify-between px-4 py-2 rounded-[32px] shrink-0 w-full text-sm font-normal text-white dark:text-white placeholder:text-gray-700 dark:placeholder:text-gray-700 leading-[22px] outline-none focus:border-gray-600 dark:focus:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {/* Send button */}
          {inputValue.trim() && !isStreaming && (
            <button
              onClick={handleInputSubmit}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300 rotate-90"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          )}
          {/* Streaming indicator */}
          {isStreaming && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>
      </div>

      {/* Exit Chat Banner */}
      <ExitChatBanner />
    </div>
  )
}
