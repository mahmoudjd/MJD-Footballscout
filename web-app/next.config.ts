import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
        remotePatterns: [{
            protocol: "https",
            hostname: "cdn.resfu.com",
        }, {
            protocol: "https",
            hostname: "www.playmakerstats.com"
        }]
    },
};

export default nextConfig;
