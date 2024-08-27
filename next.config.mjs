/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    JIGSAWSTACK_API_KEY: process.env.JIGSAWSTACK_API_KEY,
  },
}

export default nextConfig;