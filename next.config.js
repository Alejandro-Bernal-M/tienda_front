const createNextIntlPlugin = require('next-intl/plugin');

// Apuntamos al archivo de configuración de i18n
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 1. Permitir imágenes de Unsplash (Para el Hero Section)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // 2. Permitir imágenes de tu Backend Local (Para los productos)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      // 3. Permitir imágenes si tu backend está en otra IP local (Opcional)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000', 
        pathname: '/**',
      },
      // 4. Permitir imágenes sin puerto especificado
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      }
    ],
  },
};

module.exports = withNextIntl(nextConfig);