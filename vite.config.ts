import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
  // Vite root = src/popup so index.html lands at dist/index.html (not dist/src/popup/index.html)
  root: resolve(__dirname, 'src/popup'),
  base: './',           // relative asset paths — required for Chrome extension URLs
  plugins: [
    react(),
    {
      name: 'copy-static',
      writeBundle() {
        fs.mkdirSync(resolve(__dirname, 'dist'), { recursive: true })

        // SVG favicon for the popup tab
        fs.copyFileSync(
          resolve(__dirname, 'icons/icon.svg'),
          resolve(__dirname, 'dist/icon.svg'),
        )

        // Build manifest — inject icon entries only when PNGs exist
        const manifest = JSON.parse(fs.readFileSync(resolve(__dirname, 'manifest.json'), 'utf-8'))
        const pngSizes = [16, 48, 128].filter(size => {
          const src = resolve(__dirname, `icons/icon${size}.png`)
          if (!fs.existsSync(src)) return false
          fs.copyFileSync(src, resolve(__dirname, `dist/icon${size}.png`))
          return true
        })
        if (pngSizes.length === 3) {
          const iconMap = Object.fromEntries(pngSizes.map(s => [String(s), `icon${s}.png`]))
          manifest.icons = iconMap
          manifest.action.default_icon = iconMap
        }
        fs.writeFileSync(resolve(__dirname, 'dist/manifest.json'), JSON.stringify(manifest, null, 2))
      },
    },
  ],
  resolve: {
    alias: {
      // Use @lib and @t in import paths instead of ../../lib/...
      '@lib': resolve(__dirname, 'src/lib'),
      '@t':   resolve(__dirname, 'src/types'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
})
