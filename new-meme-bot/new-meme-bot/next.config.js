/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['canvas', 'better-sqlite3'],
  turbopack: {},
};

module.exports = nextConfig;
