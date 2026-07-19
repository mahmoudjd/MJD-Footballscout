import type { Metadata } from "next"
import { PlayerProfilePageView } from "@/features/profile/components/PlayerProfilePageView"
import { notFound } from "next/navigation"

interface ProfilePageProps {
  params: Promise<{ playerId: string }>
}

export const metadata: Metadata = {
  title: "Player Profile",
  description: "Review player information, attributes, history, and scouting reports.",
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { playerId } = await params
  return playerId ? <PlayerProfilePageView playerId={playerId} /> : notFound()
}
