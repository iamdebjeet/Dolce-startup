import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The old standalone pages now live as sections of the one-page home.
  async redirects() {
    return [
      { source: "/about", destination: "/#story", permanent: false },
      { source: "/reviews", destination: "/#reviews", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
      { source: "/menu", destination: "/#menu", permanent: false },
    ];
  },
};

export default nextConfig;
