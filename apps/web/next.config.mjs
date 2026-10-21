/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tulsi/contracts', '@tulsi/utils'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
