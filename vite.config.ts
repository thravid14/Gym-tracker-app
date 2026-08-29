import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// GitHub Pages serves project sites from a subpath (/<repo-name>/), so the
// production build needs that as its base — but local dev/preview should
// keep running at root. GITHUB_PAGES is set by the deploy workflow only.
// The Vercel deploy serves this app as a /gym/ zone proxied from the meal
// app's domain (so the two apps share localStorage on one origin) — VERCEL
// is set automatically by Vercel's build environment.
const base = process.env.GITHUB_PAGES ? '/Gym-tracker-app/' : process.env.VERCEL ? '/gym/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gym Log',
        short_name: 'Gym Log',
        description: 'Personal gym log and split-based exercise suggester',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // exercises.json is bundled into the JS chunk, so precaching the
        // standard build output is enough for full offline use.
        globPatterns: ['**/*.{js,css,html,svg}'],
      },
    }),
  ],
})
