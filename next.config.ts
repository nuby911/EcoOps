import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  // TF.js packages need to be transpiled for Next.js ESM compatibility
  transpilePackages: [
    'motion',
    '@tensorflow/tfjs',
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-backend-webgpu',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow/tfjs-backend-cpu',
    '@tensorflow/tfjs-converter',
    '@tensorflow/tfjs-layers',
    '@tensorflow-models/coco-ssd',
  ],
  webpack: (config, {dev, isServer}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    // ── TensorFlow.js Browser-only Setup ──────────────────────────────────────
    // Mark Node.js-only TF.js bindings as external so they don't get bundled
    // into the client-side bundle. The browser uses WebGPU/WebGL instead.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        'node-gyp-build': false,
      };

      // Exclude Node.js native TF.js bindings from client bundle
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@tensorflow/tfjs-node',
        '@tensorflow/tfjs-node-gpu',
      ];
    }

    // Handle .wasm files used by TF.js backends
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
