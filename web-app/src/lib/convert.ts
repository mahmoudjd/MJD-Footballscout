export function convert(name: string | undefined | null) {
  if (!name) return ""
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
}
