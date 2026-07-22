import type { NextConfig } from "next";
import path from "path";

// ─── Security: Validate backend URL to prevent SSRF ─────────────────────────
// Only allow known safe hostnames in the rewrite destination.
const ALLOWED_BACKEND_HOSTS = [
  'govprep-backend.onrender.com',
  'localhost',
  '127.0.0.1',
];

function getSafeBackendUrl(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL ||
    (isProd ? 'https://govprep-backend.onrender.com' : 'http://localhost:5001');

  try {
    const parsed = new URL(raw);
    const hostname = parsed.hostname;
    const isAllowed = ALLOWED_BACKEND_HOSTS.some(h => hostname === h || hostname.endsWith(`.${h}`));
    if (!isAllowed) {
      console.error(`[Security] NEXT_PUBLIC_BACKEND_URL hostname "${hostname}" is not in the allowlist. Falling back to safe default.`);
      return isProd ? 'https://govprep-backend.onrender.com' : 'http://localhost:5001';
    }
    return raw.replace(/\/$/, ''); // strip trailing slash
  } catch {
    console.error(`[Security] NEXT_PUBLIC_BACKEND_URL is not a valid URL: "${raw}". Falling back to safe default.`);
    return isProd ? 'https://govprep-backend.onrender.com' : 'http://localhost:5001';
  }
}

// ─── Security: Content-Security-Policy ──────────────────────────────────────
// theme-init.js is served as a static file from /public, so it is covered by
// script-src 'self' — no 'unsafe-inline' needed.
// react-hot-toast and Recharts use inline styles → style-src 'unsafe-inline'.
// YouTube embeds use img.youtube.com → img-src covers thumbnails.
// Socket.io uses ws/wss → connect-src covers WebSocket connections.
const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;
const backendHost = isProd ? 'https://govprep-backend.onrender.com' : 'http://localhost:5001';
const wsBackendHost = isProd ? 'wss://govprep-backend.onrender.com' : 'ws://localhost:5001';

// SECURITY: 'unsafe-eval' is ONLY added in development because Webpack's hot
// module replacement (HMR) uses eval() for source maps. In production (Next.js
// build output), eval() is never used — so the stricter policy applies.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://img.youtube.com https://images.unsplash.com ${backendHost};
  connect-src 'self' ${backendHost} ${wsBackendHost}${isDev ? ' ws://localhost:3000 http://localhost:3000' : ''};
  media-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isProd ? 'upgrade-insecure-requests;' : ''}
`.replace(/\s{2,}/g, ' ').trim();


const nextConfig: NextConfig = {
  devIndicators: false,

  // Force Turbopack to resolve relative to the client folder instead of the user's home directory.
  // This resolves public/ static asset mapping errors in local dev mode.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // SECURITY: React Strict Mode catches unsafe lifecycles and deprecated patterns.
  // Re-enabled — the double-render in dev is intentional and worth the safety.
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    minimumCacheTTL: 3600,
  },

  // Reduce bundle size by tree-shaking server-only code
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  async rewrites() {
    const backendUrl = getSafeBackendUrl();
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        // ─── Security headers applied to ALL routes ──────────────────────────
        source: '/(.*)',
        headers: [
          // ── Prevent MIME-type sniffing attacks ────────────────────────────
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // ── Block clickjacking: disallow this site being embedded in frames
          { key: 'X-Frame-Options', value: 'DENY' },

          // ── HSTS: force HTTPS for 2 years, include subdomains ─────────────
          // Only effective in production; browsers ignore on HTTP
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },

          // ── Control referrer information leakage ──────────────────────────
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // ── Disable browser DNS prefetching (privacy) ─────────────────────
          { key: 'X-DNS-Prefetch-Control', value: 'off' },

          // ── Restrict browser feature/API access ───────────────────────────
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'interest-cohort=()',
            ].join(', '),
          },

          // ── Content Security Policy ───────────────────────────────────────
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },

          // ── Cross-Origin isolation headers ────────────────────────────────
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },

          // ── Prevent caching of sensitive HTML pages ───────────────────────
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },

      {
        // ─── Static assets: aggressive caching, relaxed CORP ────────────────
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },

      {
        // ─── Public image assets ─────────────────────────────────────────────
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },

      {
        // ─── theme-init.js: allow cross-origin read as it's a public script ──
        source: '/theme-init.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
    ];
  },
};

export default nextConfig;
