import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  // Relative prefix so /{SECURE_PATH}/panel resolves ./_next → /{SECURE_PATH}/_next
  // (absolute /_next would bypass the stealth UUID and 404 once configured).
  assetPrefix: '.',
};

export default nextConfig;
