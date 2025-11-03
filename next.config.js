/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // ✅ Skip ESLint during builds
    },
};

module.exports = nextConfig;
