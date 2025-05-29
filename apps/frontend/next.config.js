/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['shared', 'coupons'],
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
};

module.exports = nextConfig;
