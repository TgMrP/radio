import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'img/icons/*'],
      manifest: {
        name: 'רדיו ישראלי',
        short_name: 'Iradio',
        description: 'האזן עכשיו למיטב תחנות הרדיו בישראל',
        theme_color: '#48bb78',
        background_color: '#48bb78',
        dir: 'rtl',
        lang: 'he',
        icons: [
          { src: 'img/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'img/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'img/icons/android-chrome-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'img/icons/android-chrome-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
