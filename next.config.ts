import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        formats: [
            "image/webp"
        ],
        remotePatterns: [{
            hostname: "v3b.fal.media"
        }]
    }
  /* config options here */
};

export default nextConfig;
