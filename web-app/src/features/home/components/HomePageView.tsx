import { HomeStats } from "@/features/home/components/home-stats"
import { ImageBackground } from "@/components/common/image-background"

export function HomePageView() {
  return (
    <ImageBackground>
      <div className="flex min-h-screen items-center justify-center bg-stone-950/20 p-4 backdrop-blur-[1px] md:p-6">
        <HomeStats />
      </div>
    </ImageBackground>
  )
}
