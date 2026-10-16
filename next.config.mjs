/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  webpack: (config, { dev }) => {
    // Webpack's persistent build cache corrupts between builds on Node 26 ("reading 'hash'").
    if (!dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
