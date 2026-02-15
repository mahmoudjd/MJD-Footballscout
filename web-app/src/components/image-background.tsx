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

  // Preload all images
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Background transition logic
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
      className="min-h-screen w-full bg-cover bg-center transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {children}
    </div>
  )
}
