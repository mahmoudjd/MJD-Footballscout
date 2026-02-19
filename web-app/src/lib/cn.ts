import { twMerge } from "tailwind-merge"

type ClassDictionary = Record<string, boolean | null | undefined>
type ClassArray = ClassInput[]

export type ClassInput =
  | string
  | number
  | null
  | undefined
  | false
  | ClassDictionary
  | ClassArray

function cx(...inputs: ClassInput[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input))
      continue
    }

    if (Array.isArray(input)) {
      const nested = cx(...input)
      if (nested) classes.push(nested)
      continue
    }

    for (const [key, value] of Object.entries(input)) {
      if (value) classes.push(key)
    }
  }

  return classes.join(" ")
}

export function cn(...inputs: ClassInput[]) {
  return twMerge(cx(...inputs))
}
