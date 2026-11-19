import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
      },
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
  poweredByHeader: false,
  async headers() {
    return [
      {
        // ponytail: baseline headers only; a full script-src CSP needs nonces for
        // Speed Insights / Google sign-in — add it when ads (AdSense) go live.
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        // iOS requires the Apple App Site Association file to be served as JSON.
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ]
  },
}

export default nextConfig
