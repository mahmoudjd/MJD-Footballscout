import { HomeStats } from "@/features/home/components/home-stats"
import { ImageBackground } from "@/components/common/image-background"
import { ActionLink } from "@/components/ui/action-link"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { appShellWidthClassName } from "@/components/ui/page-container"
import { cn } from "@/lib/cn"

const capabilities = [
  { value: "Live", label: "player data" },
  { value: "Smart", label: "comparison" },
  { value: "Fast", label: "shortlisting" },
]

export function HomePageView() {
  return (
    <div>
      <ImageBackground>
        <section
          className={cn(
            "mx-auto flex min-h-[650px] w-full items-center px-4 py-20 sm:px-6 lg:px-8 lg:py-28",
            appShellWidthClassName,
          )}
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-200/20 bg-lime-200/10 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-lime-200 uppercase backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_16px_rgba(190,242,100,0.9)]"
                aria-hidden="true"
              />
              Modern football intelligence
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl leading-[0.96] font-black tracking-[-0.055em] text-white sm:text-6xl lg:text-8xl">
              Find the player who changes the game.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-emerald-50/75 sm:text-lg sm:leading-8">
              Search live player profiles, compare key metrics, and turn scattered football data
              into confident scouting decisions.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ActionLink
                href="/search"
                variant="secondary"
                size="lg"
                className="group min-w-44 justify-center bg-lime-300 text-emerald-950 hover:bg-lime-200"
              >
                Start scouting
                <OutlineIcons.ArrowTrendingUpIcon
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </ActionLink>
              <ActionLink
                href="/players"
                variant="outline"
                size="lg"
                className="min-w-44 justify-center border-white/25 bg-white/8 text-white hover:border-white/40 hover:bg-white/14"
              >
                Browse players
              </ActionLink>
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-3 border-t border-white/15 pt-6">
              {capabilities.map((item) => (
                <div key={item.label}>
                  <dt className="text-xl font-extrabold text-white sm:text-2xl">{item.value}</dt>
                  <dd className="mt-1 text-xs text-emerald-50/55 sm:text-sm">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </ImageBackground>

      <section className="relative border-t border-emerald-950/8 bg-[#f5f7f4] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,60,44,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,60,44,0.035)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[size:48px_48px]" />
        <div className={cn("relative mx-auto", appShellWidthClassName)}>
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">
              Live database
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-emerald-950 sm:text-4xl">
              Your scouting picture, at a glance.
            </h2>
            <p className="mt-3 leading-7 text-stone-600">
              Current rankings, market signals, and talent indicators from the players you track.
            </p>
          </div>
          <HomeStats />
        </div>
      </section>
    </div>
  )
}
