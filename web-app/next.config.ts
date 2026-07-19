import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.resfu.com",
      },
      {
        protocol: "https",
        hostname: "www.playmakerstats.com",
      },
      {
        protocol: "https",
        hostname: "www.besoccer.com",
      },
      {
        protocol: "https",
        hostname: "img.besoccer.com",
      },
    ],
  },
}

export default nextConfig
