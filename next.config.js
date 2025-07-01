/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["ufmysxronjaohovgoecc.supabase.co"],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore specific modules that might cause issues
    config.resolve.alias = {
      ...config.resolve.alias,
      "@clerk/nextjs": false,
    }
    return config
  },
}

module.exports = nextConfig
