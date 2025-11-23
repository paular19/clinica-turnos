/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverActions: true,
    reactRoot: true
  },
  images: {
    domains: ["images.unsplash.com", "picsum.photos", "avatars.githubusercontent.com"]
  },
  compiler: {
    // turn off styled-jsx if used
    styledComponents: false
  }
}

module.exports = nextConfig
