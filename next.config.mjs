const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Lint is enforced in CI (pnpm lint); skip it during the Vercel/Docker build
    // to avoid duplicate failures and keep build times fast.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
