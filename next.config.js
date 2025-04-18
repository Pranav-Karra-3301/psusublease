/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'xjwndkjwaxhxqtmfeulp.supabase.co', 'jbbdxvmlktaqapclgolt.supabase.co', 'psusublease.vercel.app', 'images.unsplash.com'],
  },
};

module.exports = nextConfig; 