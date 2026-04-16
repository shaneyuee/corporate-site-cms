import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.xscraper.cn",
      },
      {
        protocol: "http",
        hostname: "precious-stone.cn",
      },
      {
        protocol: "https",
        hostname: "precious-stone.cn",
      },
      {
        protocol: "http",
        hostname: "81.71.32.222",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
