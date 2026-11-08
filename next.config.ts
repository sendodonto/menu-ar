import type { NextConfig } from 'next';

// GitHub Pages serves the app under /<repo>; set NEXT_PUBLIC_BASE_PATH=/menu-ar for that build.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default config;
