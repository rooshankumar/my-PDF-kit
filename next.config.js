
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  webServer: {
    hostname: '0.0.0.0',
    port: 3000
  }
}

module.exports = nextConfig
