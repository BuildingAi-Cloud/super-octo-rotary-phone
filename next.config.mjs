const strictTypecheck = process.env.RELEASE_STRICT_TYPES === "true" || process.env.CI === "true"

const nextConfig = {
  output: "standalone",
  typescript: {
    // Keep local iteration fast, but enforce strict types in CI/release.
    ignoreBuildErrors: !strictTypecheck,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
