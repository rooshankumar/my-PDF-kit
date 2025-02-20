/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable static exports for Netlify
  output: 'export',
  
  // Disable image optimization since it's not supported with 'output: export'
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes are handled correctly
  // trailingSlash: true,
}

module.exports = nextConfig 