import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(), // Temporarily disabled to debug component resolution issues
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    hmr: {
      port: 24678,
      clientPort: 24678,
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild', // Use esbuild instead of terser
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Vendor chunks
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // Feature chunks
          auth: [
            './src/views/LoginView.vue',
            './src/views/RegisterView.vue',
            './src/components/auth/LoginForm.vue',
            './src/components/auth/RegisterForm.vue',
          ],
          marketplace: [
            './src/views/MarketplaceView.vue',
            './src/views/MarketplaceViewEnhanced.vue',
            './src/components/search/AdvancedSearch.vue',
          ],
          admin: [
            './src/_hidden/views/AdminView.vue',
            './src/_hidden/views/UsersView.vue',
            './src/_hidden/views/DatabaseManagementView.vue',
            './src/_hidden/views/TableManagementView.vue',
            './src/_hidden/views/AuditLogsView.vue',
          ],
          analytics: [
            './src/views/AnalyticsView.vue',
            './src/_hidden/views/AnalyticsView.vue',
            './src/utils/analytics.js',
          ],
        },
        // Optimize asset file names for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: [
      // Exclude heavy dependencies that should be loaded on demand
    ],
  },
})
