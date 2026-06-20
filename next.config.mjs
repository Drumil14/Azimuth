/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static demo — don't let lint warnings block a deploy. Types are still checked.
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
