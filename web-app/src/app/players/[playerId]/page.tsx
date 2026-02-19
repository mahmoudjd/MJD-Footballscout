import { PlayerProfilePageView } from "@/components/profile/PlayerProfilePageView"
import { notFound } from "next/navigation"

interface ProfilePageProps {
  params: Promise<{ playerId: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { playerId } = await params
  return playerId ? <PlayerProfilePageView playerId={playerId} /> : notFound()
}
