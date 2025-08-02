/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure allowed dev origins for CORS
  allowedDevOrigins: [
    '141.140.12.27',
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ],
  images: {
    domains: [
      'terabox.com',
      '1024tera.com',
      'dubox.com',
      'via.placeholder.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;