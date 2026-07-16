import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  // Static export is served from Workers ASSETS — relative asset paths
  assetPrefix: undefined,
};

export default nextConfig;
