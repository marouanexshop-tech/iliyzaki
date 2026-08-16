import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities listed here; the slider asks for 90.
    qualities: [75, 90],
  },
};

export default nextConfig;
