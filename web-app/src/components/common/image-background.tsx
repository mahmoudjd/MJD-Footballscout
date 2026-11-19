import Image from "next/image"
import { ReactNode } from "react"

export function ImageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-[650px] w-full overflow-hidden bg-[#0b1130]">
      <Image
        src="/backgrounds/7.jpg"
        alt="Football stadium under floodlights"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,15,41,0.96)_0%,rgba(10,15,41,0.84)_44%,rgba(10,15,41,0.35)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_42%,rgba(215,255,69,0.16),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-linear-to-t from-[#0b1130] to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
