"use client"

import React, { useState, useEffect } from "react"
import { OutlineIcons } from "@/components/outline-icons"

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed right-6 bottom-6 z-50 cursor-pointer rounded-full bg-cyan-600 p-3 text-white shadow-lg transition hover:bg-cyan-700"
    >
      <OutlineIcons.ArrowUpIcon className="h-6 w-6" />
    </button>
  )
}
