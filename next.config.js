/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Netlify
  output: 'export',
  
  // Disable image optimization since it's not supported with 'output: export'
  images: {
    unoptimized: true,
  },
  // Add this to disable server-side features
  experimental: {
    appDir: true,
  },
  // Ensure trailing slashes are handled correctly
  trailingSlash: true,
}

module.exports = nextConfig 