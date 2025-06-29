import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Pela Marca',
        short_name: 'Pela Marca',
        start_url: '/',
        display: 'standalone',
        description: 'Pela Marca - Gerencie suas peladas de futebol',
        theme_color: '#1B3A2D',
        background_color: '#1B3A2D',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '500x500',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: "/screenshots/home.png",
            type: "image/png",
            sizes: "1280x720",
            form_factor: "wide"
          }
        ]
      },
    }),
  ],
  server: {
    host: true, // ou use '0.0.0.0'
    port: 5173, // ou qualquer outra porta que quiser
  },
})
