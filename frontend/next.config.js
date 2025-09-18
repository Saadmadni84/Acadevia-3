/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable webpack cache to prevent cache issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  // Experimental features
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
