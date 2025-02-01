/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
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