import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  // Absolute /_next — required for nested routes (/panel/cleanip).
  // Worker serves /_next/* publicly; HTML/API stay behind SECURE PATH.
  assetPrefix: '',
};

export default nextConfig;
