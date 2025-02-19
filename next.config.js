/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Netlify
  output: 'export',
  
  // Disable image optimization since it's not supported with 'output: export'
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 