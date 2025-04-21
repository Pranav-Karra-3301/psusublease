/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [],
    domains: ['localhost', 'xjwndkjwaxhxqtmfeulp.supabase.co', 'jbbdxvmlktaqapclgolt.supabase.co', 'psuleases.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig; 