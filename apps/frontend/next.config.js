/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['shared', 'coupons'],
};

module.exports = nextConfig;
