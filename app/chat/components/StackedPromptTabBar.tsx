"use client"

import { useRef, useEffect, useState } from "react"
import { PromptHistoryItem } from "../page"

interface StackedPromptTabBarProps {
  promptHistory: PromptHistoryItem[]
  currentHistoryId: string | null
  onHistoryItemClick: (id: string) => void
  onExpandChange?: (expanded: boolean) => void
  collapseRef?: React.MutableRefObject<(() => void) | null>
}

const CARD_HEIGHT = 40
const STACK_OFFSET = 8
const MAX_VISIBLE = 3
const LIST_MAX_HEIGHT = 320

export function StackedPromptTabBar({
  promptHistory,
  currentHistoryId,
  onHistoryItemClick,
  onExpandChange,
  collapseRef,
}: StackedPromptTabBarProps) {
  const [isListView, setIsListView] = useState(false)

  const setExpanded = (val: boolean) => {
    setIsListView(val)
    onExpandChange?.(val)
  }

  useEffect(() => {
    if (collapseRef) collapseRef.current = () => setExpanded(false)
  })

  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevLengthRef = useRef(0)

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

  useEffect(() => {
    if (promptHistory.length > prevLengthRef.current && promptHistory.length > 0) {
      setJustAddedId(promptHistory[0].id)
      const timer = setTimeout(() => setJustAddedId(null), 500)
      prevLengthRef.current = promptHistory.length
      return () => clearTimeout(timer)
    }
    prevLengthRef.current = promptHistory.length
  }, [promptHistory])

  const handleCardClick = (id: string) => {
    playAudio()
    onHistoryItemClick(id)
    setExpanded(false)
  }

  if (promptHistory.length === 0) return null

  const activeItem = promptHistory.find((c) => c.id === currentHistoryId)
  const otherItems = promptHistory.filter((c) => c.id !== currentHistoryId)
  const reordered = activeItem ? [activeItem, ...otherItems] : promptHistory
  const visibleCards = reordered.slice(0, MAX_VISIBLE)
  const collapsedHeight = CARD_HEIGHT + (visibleCards.length - 1) * STACK_OFFSET

  return (
    <div className="relative w-full">
      {/* Collapsed stack */}
      <div
        className={`relative w-full transition-opacity duration-300 ease-in-out ${
          isListView ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ height: collapsedHeight }}
      >
        <div
          className="relative w-full cursor-pointer"
          style={{ height: collapsedHeight }}
          onClick={() => setExpanded(true)}
          role="button"
          aria-label="View prompt history"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setExpanded(true)}
        >
          {visibleCards.map((card, stackIndex) => {
            const topOffset = stackIndex * STACK_OFFSET
            const scale = 1 - stackIndex * 0.03
            const opacity = 1 - stackIndex * 0.15
            const zIndex = MAX_VISIBLE - stackIndex
            const isFront = stackIndex === 0

            return (
              <div
                key={card.id}
                className={isFront && justAddedId === card.id ? "animate-card-push" : ""}
                style={{
                  position: "absolute",
                  top: topOffset,
                  left: 0,
                  right: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: "center top",
                  opacity,
                  zIndex,
                }}
              >
                <div
                  className={`border border-[#374151] flex items-center justify-between px-2.5 rounded-2xl w-full overflow-hidden transition-all duration-200 ${isFront ? "bg-[#111827]" : "bg-black"}`}
                  style={{ height: CARD_HEIGHT }}
                >
                  <span className="text-xs font-light leading-4 text-[#d1d5db] dark:text-[#d1d5db] truncate flex-1 mr-2">
                    {card.text}
                  </span>
                  {isFront && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500 shrink-0"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expanded panel */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ease-out origin-top ${
          isListView
            ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
        }`}
        role="listbox"
        aria-label="Prompt history"
        aria-hidden={!isListView}
      >
        <div className="bg-[#0c0c0c] border border-[#374151] rounded-2xl pl-[13px] pr-[1px] py-[13px] flex flex-col gap-2">
          <div className="flex items-center justify-between pr-3">
            <span className="text-xs font-normal text-[#9ca3af]">Recent Prompts</span>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Collapse prompt history"
              className="text-[#9ca3af] hover:text-gray-300 active:text-[#9ca3af] transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-gray-600 p-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>

          <div
            className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide pr-3"
            style={{ maxHeight: LIST_MAX_HEIGHT }}
          >
            {promptHistory.map((card) => {
              const isActive = card.id === currentHistoryId
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  role="option"
                  aria-selected={isActive}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-left transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-gray-600 ${
                    isActive
                      ? "bg-[#111827]"
                      : "bg-black border border-[#1f2937] hover:bg-[#182236] active:bg-[#111827]"
                  }`}
                >
                  <span className="text-xs font-medium leading-4 truncate w-full block text-[#d1d5db]">
                    {card.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
