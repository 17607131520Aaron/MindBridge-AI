import type { NextConfig } from "next";

const imageRemoteHosts = (process.env.NEXT_IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    remotePatterns: imageRemoteHosts.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};


export default nextConfig;
