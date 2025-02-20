/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  typescript: {
    // Don't fail build on TypeScript errors during deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't fail build on ESLint errors during deployment
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig