/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Remove the output: 'export' if you want to use middleware
  // or remove middleware if you need static export
}

module.exports = nextConfig