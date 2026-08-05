import { useSegments } from "expo-router";
import type { Href } from "expo-router";

/**
 * Player detail lives inside every content tab's stack (so the native tab bar
 * stays visible). A player link must therefore push within the CURRENT tab, not
 * jump to root. Segment[1] is the tab: "(home)" | "search" | "playerList". The
 * "(home)" group adds no path segment, so `/(home)/:id` resolves to `/:id`.
 *
 * Returns a builder because a list renders many links but shares one tab segment.
 */
export function usePlayerHrefBuilder(): (id: string) => Href {
  const segments = useSegments();
  const tab = segments[1] ?? "(home)";
  return (id: string) => `/${tab}/${id}` as Href;
}
