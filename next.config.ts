import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    // Public assets use stable names: cache briefly, then revalidate updates.
    const media = ["/backgrounds/:path*", "/images/:path*", "/models/:path*", "/3d/:path*", "/fonts/:path*"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
    }));
    return [...media, {
      source: "/backgrounds/sarj/:file(index.html|canvas.js|canvas.css)",
      headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
    }];
  },
};

export default nextConfig;
