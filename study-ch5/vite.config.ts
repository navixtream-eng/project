import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Deja solo el formato woff2 en el CSS de KaTeX (elimina los fallbacks
 * woff/ttf). En el build de archivo único evita inlinear ~1.5 MB de
 * fuentes redundantes; todo navegador moderno soporta woff2.
 */
const trimKatexFontFallbacks = (): Plugin => ({
  name: 'trim-katex-font-fallbacks',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('katex') || !id.split('?')[0].endsWith('.css')) return null
    return code
      .replace(/,url\([^)]+\.woff\)\s*format\(["']woff["']\)/g, '')
      .replace(/,url\([^)]+\.ttf\)\s*format\(["']truetype["']\)/g, '')
  },
})

// https://vite.dev/config/
// - `npm run build` genera la PWA instalable (manifest + service worker,
//   base relativa: sirve igual en GitHub Pages, Netlify o cualquier carpeta).
// - `SINGLEFILE=1 npm run build` genera dist/index.html autocontenido
//   (JS, CSS y fuentes inlineados) para publicarlo como página estática.
export default defineConfig(() => {
  const single = process.env.SINGLEFILE === '1'
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      ...(single
        ? [trimKatexFontFallbacks(), viteSingleFile()]
        : [
            VitePWA({
              registerType: 'autoUpdate',
              injectRegister: 'script',
              includeAssets: ['pwa-192.png', 'pwa-512.png'],
              manifest: {
                name: 'Máquinas Sincrónicas — Documento de Estudio',
                short_name: 'SyncStudy',
                description:
                  'Documento de estudio interactivo de máquinas sincrónicas (FKU Cap. 5 y 6): laboratorios, chequeos Feynman y problemas resueltos.',
                lang: 'es',
                display: 'standalone',
                background_color: '#09090b',
                theme_color: '#09090b',
                icons: [
                  { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
                  { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
                  { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
              },
              workbox: {
                // La app entera (JS, CSS, fuentes KaTeX) queda en caché: uso offline
                globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
              },
            }),
          ]),
    ],
    build: single ? { assetsInlineLimit: 100_000_000 } : undefined,
  }
})
