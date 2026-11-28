import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function pwaDevSafetyPlugin(): Plugin {
  const virtualId = 'virtual:pwa-register';
  const resolvedVirtualId = `\0${virtualId}`;

  return {
    name: 'aos-pwa-dev-safety',
    apply: 'serve',
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
      return null;
    },
    load(id) {
      if (id === resolvedVirtualId) {
        return 'export function registerSW() { return async () => {}; }\n';
      }
      return null;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/@vite-plugin-pwa/pwa-entry-point-loaded') {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-store');
          res.end('export default function registerDevSW() {}\n');
          return;
        }
        if (url === '/dev-sw.js') {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-store');
          res.end(
            "self.addEventListener('install', () => self.skipWaiting());\n" +
              "self.addEventListener('activate', (e) => e.waitUntil(self.registration.unregister()));\n"
          );
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      command === 'serve'
        ? pwaDevSafetyPlugin()
        : VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            injectRegister: false,
            includeAssets: [
              'icon-192.png',
              'icon-512.png',
              'pwa-maskable-512x512.png',
              'apple-touch-icon.png',
              'favicon.png',
              'manifest.json',
            ],
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
              globIgnores: ['**/standalone-index.html', '**/robots.txt', '**/sitemap.xml'],
              maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
              cleanupOutdatedCaches: true,
              navigateFallback: '/index.html',
              navigateFallbackDenylist: [/^\/api\//, /^\/robots\.txt$/, /^\/sitemap\.xml$/, /\.pdf$/i],
              runtimeCaching: [
                {
                  urlPattern: ({ request }) => request.destination === 'document',
                  handler: 'NetworkFirst',
                  options: {
                    cacheName: 'aos-pages-cache',
                    networkTimeoutSeconds: 4,
                  },
                },
                {
                  urlPattern: ({ request }) =>
                    request.destination === 'style' ||
                    request.destination === 'script' ||
                    request.destination === 'worker',
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'aos-assets-cache',
                  },
                },
                {
                  urlPattern: ({ request }) => request.destination === 'image',
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'aos-images-cache',
                    expiration: {
                      maxEntries: 80,
                      maxAgeSeconds: 30 * 24 * 60 * 60,
                    },
                    cacheableResponse: {
                      statuses: [0, 200],
                    },
                  },
                },
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'aos-google-fonts-styles',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                    cacheableResponse: {
                      statuses: [0, 200],
                    },
                  },
                },
                {
                  urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'aos-google-fonts-webfonts',
                    expiration: {
                      maxEntries: 20,
                      maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                    cacheableResponse: {
                      statuses: [0, 200],
                    },
                  },
                },
              ],
            },
            devOptions: {
              enabled: false,
            },
          }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? process.cwd(), '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
      modulePreload: {
        resolveDependencies: (_filename, deps) =>
          deps.filter(
            (dep) => !dep.includes('vendor-pdf-libs') && !dep.includes('vendor-archive')
          ),
      },
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (
              id.includes('node_modules/firebase/') ||
              id.includes('node_modules/@firebase/')
            ) {
              return 'vendor-firebase';
            }
            if (
              id.includes('node_modules/pdf-lib/') ||
              id.includes('node_modules/pdfjs-dist/') ||
              id.includes('node_modules/@pdfsmaller/')
            ) {
              return 'vendor-pdf-libs';
            }
            if (id.includes('node_modules/jszip/') || id.includes('node_modules/pako/')) {
              return 'vendor-archive';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
