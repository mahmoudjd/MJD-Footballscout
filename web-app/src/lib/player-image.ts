const DEFAULT_PLAYER_IMAGE = "/mjd-logo.png"
const ALLOWED_REMOTE_HOSTS = new Set([
  "cdn.resfu.com",
  "www.playmakerstats.com",
  "www.besoccer.com",
  "img.besoccer.com",
])

function isAllowedRemoteImage(url: string) {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === "https:" && ALLOWED_REMOTE_HOSTS.has(parsedUrl.hostname)
  } catch {
    return false
  }
}

export function getPlayerImageSrc(value: string | null | undefined) {
  const normalized = typeof value === "string" ? value.trim() : ""
  if (!normalized) {
    return DEFAULT_PLAYER_IMAGE
  }

  if (normalized.startsWith("/")) {
    return normalized
  }

  return isAllowedRemoteImage(normalized) ? normalized : DEFAULT_PLAYER_IMAGE
}
