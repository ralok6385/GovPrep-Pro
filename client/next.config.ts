import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,

  // Performance optimizations
  reactStrictMode: false, // Disable double-rendering in dev mode

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    minimumCacheTTL: 3600, // Cache optimized images for 1 hour
  },

  // Reduce bundle size by tree-shaking server-only code
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? 'https://govprep-backend.onrender.com' : 'http://localhost:5005');

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },

  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
