/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  // Skip type checking and linting during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'tokens.pancakeswap.finance',
      'assets.coingecko.com',
      'raw.githubusercontent.com',
      'pancakeswap.finance',
      'changenow.io',
      'upload.wikimedia.org',
      'avatars.githubusercontent.com',
      'trustwallet.com',
      'public.bnbstatic.com',
      's2.coinmarketcap.com',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://changenow.io",
              "frame-src 'self' https://changenow.io https://guardarian.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https: wss:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
