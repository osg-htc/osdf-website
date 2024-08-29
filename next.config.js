/** @type {import('next').NextConfig} */
module.exports = {
    output: 'standalone',
    staticPageGenerationTimeout: 1000,
    experimental: {
        outputStandalone: true,
    }
}