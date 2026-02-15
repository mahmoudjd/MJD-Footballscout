import { ImageBackground } from "@/components/image-background"
import { HomeStats } from "@/components/home/home-stats"

export default function HomePage() {
  return (
    <ImageBackground>
      <div className="flex min-h-screen items-center justify-center bg-black/60 p-4 md:p-6">
        <HomeStats />
      </div>
    </ImageBackground>
  )
}
