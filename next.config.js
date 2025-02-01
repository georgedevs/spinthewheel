/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // This will make all pages render at runtime instead of build time
    workerThreads: true,
    cpus: 1
  },
  // Disable static page generation
  staticPageGenerationTimeout: 0,
  // Force dynamic rendering
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  }
}

module.exports = nextConfig