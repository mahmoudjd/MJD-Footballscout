import type { Metadata } from "next"
import { ShadowTeamPageView } from "@/features/shadow-team/components/ShadowTeamPageView"

export const metadata: Metadata = {
  title: "Squad Builder | MJD Football Scout",
  description: "Build squad formations, compare candidates and identify recruitment gaps.",
}

export default function ShadowTeamPage() {
  return <ShadowTeamPageView />
}
