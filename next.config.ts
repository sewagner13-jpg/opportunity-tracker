import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any source (for potential future use)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
