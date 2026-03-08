/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['cdn.sanity.io'],
    unoptimized: false,
  },
};
module.exports = nextConfig;
