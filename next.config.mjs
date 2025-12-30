/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // This allows the build to finish even if there are type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // This allows the build to finish even if there are linting errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;