"use client"
import { ReactNode, useEffect, useState } from "react"

const images: string[] = [
  "/backgrounds/0.jpg",
  "/backgrounds/1.jpg",
  "/backgrounds/3.jpg",
  "/backgrounds/4.jpg",
  "/backgrounds/5.jpg",
  "/backgrounds/6.jpg",
  "/backgrounds/7.jpg",
]

export function ImageBackground({ children }: { children: ReactNode }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const preload = (src: string) => {
      const img = new Image()
      img.src = src
    }

    preload(images[0])
    if (images[1]) preload(images[1])

    const preloadRemaining = () => {
      images.slice(2).forEach(preload)
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (typeof idleWindow.requestIdleCallback === "function") {
      const idleCallbackId = idleWindow.requestIdleCallback(preloadRemaining)
      return () => idleWindow.cancelIdleCallback?.(idleCallbackId)
    }

    const timeoutId = window.setTimeout(preloadRemaining, 1500)
    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const imageUrl = images[currentImageIndex]

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(15,23,42,0.35)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-stone-900/10 via-transparent to-stone-950/25" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
