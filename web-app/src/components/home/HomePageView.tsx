import { HomeStats } from "@/components/home/home-stats"
import { ImageBackground } from "@/components/image-background"

export function HomePageView() {
  return (
    <ImageBackground>
      <div className="flex min-h-screen items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] md:p-6">
        <HomeStats />
      </div>
    </ImageBackground>
  )
}
