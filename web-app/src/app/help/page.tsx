import type { Metadata } from "next"
import { HelpPageView } from "@/features/help/components/HelpPageView"

export const metadata: Metadata = {
  title: "Help Center",
  description: "Learn how to use MJD Football Scout and review the latest product updates.",
}

export default function HelpPage() {
  return <HelpPageView />
}
