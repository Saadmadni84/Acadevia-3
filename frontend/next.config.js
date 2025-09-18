/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  trailingSlash: false,
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
