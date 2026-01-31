/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    transpilePackages: ['@red-salud/ui', '@red-salud/core'],
};

export default nextConfig;
