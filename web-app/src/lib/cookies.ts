"use client"

const HELP_COOKIE_PREFIX = "mjd_help_seen_"

function encode(value: string) {
  return encodeURIComponent(value)
}

function decode(value: string) {
  return decodeURIComponent(value)
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null

  const encodedName = `${encode(name)}=`
  const cookies = document.cookie.split(";")

  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(encodedName)) {
      return decode(trimmed.slice(encodedName.length))
    }
  }

  return null
}

export function setCookie(name: string, value: string, days = 180) {
  if (typeof document === "undefined") return

  const maxAge = Math.max(60, Math.floor(days * 24 * 60 * 60))
  document.cookie = `${encode(name)}=${encode(value)}; path=/; max-age=${maxAge}; samesite=lax`
}

export function hasSeenHelpGuide(guideId: string) {
  return getCookie(`${HELP_COOKIE_PREFIX}${guideId}`) === "1"
}

export function markHelpGuideAsSeen(guideId: string) {
  setCookie(`${HELP_COOKIE_PREFIX}${guideId}`, "1")
}

export function resetHelpGuide(guideId: string) {
  setCookie(`${HELP_COOKIE_PREFIX}${guideId}`, "0")
}
