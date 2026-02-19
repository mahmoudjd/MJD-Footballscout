"use client"

import { useState, useEffect } from "react"
import { OutlineIcons } from "@/components/outline-icons"
import { Button } from "@/components/ui/button"

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
    <Button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      variant="primary"
      size="icon"
      className="fixed right-4 bottom-24 z-40 rounded-full shadow-lg md:right-6 md:bottom-6 md:z-50"
    >
      <OutlineIcons.ArrowUpIcon className="h-6 w-6" />
    </Button>
  )
}
