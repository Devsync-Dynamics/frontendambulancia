/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Otras configuraciones
  },
  async rewrites() {
    return [
      {
        source: '/aph-digital/edit/:id',
        destination: '/aph-digital/edit/[id]',
      },
      {
        source: '/aph-digital/view/:id',
        destination: '/aph-digital/view/[id]',
      }
    ];
  },
};

module.exports = nextConfig;