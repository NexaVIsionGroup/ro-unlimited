/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  images: {
    domains: ['cdn.sanity.io'],
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
};
module.exports = nextConfig;
