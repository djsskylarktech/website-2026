/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Next's image optimiser pulls in `sharp`, a native binary that Windows
  // Smart App Control blocks on the team's build machines. Serving the
  // originals costs a little bandwidth and keeps the site buildable there.
  images: { unoptimized: true },

  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/legacy/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
