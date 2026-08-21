/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep firebase-admin server-side only — never bundle into client
  serverExternalPackages: ['firebase-admin'],

  // Turbopack config (Next.js 16+ default bundler)
  turbopack: {},
};

export default nextConfig;
