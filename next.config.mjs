// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   images: {
// //     remotePatterns: [
// //       {
// //         protocol: 'https',
// //         hostname: 'res.cloudinary.com',
// //         port: '',
// //         pathname: '/**',
// //       },
// //     ],
// //   },
// // };

// // export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'standalone',

//   compiler: {
//     removeConsole:
//       process.env.NODE_ENV === 'production'
//         ? { exclude: ['error', 'warn'] }
//         : false,
//   },

//   experimental: {
//     optimizePackageImports: ['lucide-react', 'recharts'],
//   },

//   images: {
//     formats: ['image/avif', 'image/webp'],
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//     minimumCacheTTL: 60 * 60 * 24 * 60,
//   },

//   httpAgentOptions: {
//     keepAlive: true,
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  compress: true,

  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
