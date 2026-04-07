"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useEffect, useCallback } from "react"

export function ExitChatBanner() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    const audio = new Audio("/glitch_001.ogg")
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

  const handleExit = useCallback(() => {
    if (audioRef.current) {
      const audioClone = audioRef.current.cloneNode() as HTMLAudioElement
      audioClone.volume = audioRef.current.volume
      audioClone.play().catch((error) => {
        console.log("Glitch audio play failed:", error)
      })
    }
    router.push("/")
  }, [router])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleExit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleExit])

  return (
    <div className="flex items-center gap-[2px] mt-4">
      <span className="text-xs text-gray-400 dark:text-gray-400 leading-5 whitespace-nowrap">
        [ESC]
      </span>
      <Link
        href="/"
        onClick={handleExit}
        className="text-xs text-gray-400 dark:text-gray-400 leading-5 underline decoration-solid whitespace-nowrap hover:text-white dark:hover:text-white transition-colors"
      >
        Exit chat mode
      </Link>
    </div>
  )
}
