import { useSegments } from "expo-router";
import type { Href } from "expo-router";

/**
 * The tab the current screen lives in: "(home)" | "search" | "playerList".
 *
 * Segment[1] is the tab. The cast to string[] is deliberate: the precise tuple
 * type comes from `.expo/types/router.d.ts`, which the Metro dev server writes
 * and which is gitignored — CI has no way to generate it, so without the cast
 * `segments[1]` only typechecks on a developer machine.
 */
export function useTabSegment(): string {
  const segments = useSegments() as string[];
  return segments[1] ?? "(home)";
}

/**
 * Player detail lives inside every content tab's stack (so the native tab bar
 * stays visible). A player link must therefore push within the CURRENT tab, not
 * jump to root. The "(home)" group adds no path segment, so `/(home)/:id`
 * resolves to `/:id`.
 *
 * Returns a builder because a list renders many links but shares one tab segment.
 */
export function usePlayerHrefBuilder(): (id: string) => Href {
  const tab = useTabSegment();
  return (id: string) => `/${tab}/${id}` as Href;
}
