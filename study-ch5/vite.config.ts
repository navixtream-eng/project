import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

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
// `SINGLEFILE=1 npm run build` genera dist/index.html autocontenido
// (JS, CSS y fuentes inlineados) para publicarlo como página estática.
export default defineConfig(({ mode: _mode }) => {
  const single = process.env.SINGLEFILE === '1'
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(single ? [trimKatexFontFallbacks(), viteSingleFile()] : []),
    ],
    build: single ? { assetsInlineLimit: 100_000_000 } : undefined,
  }
})
