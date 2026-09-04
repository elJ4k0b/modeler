import html from '@rollup/plugin-html';
import css from 'rollup-plugin-css-only';
import url from 'rollup-plugin-url';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
import fs from 'fs';

export default {
  input: 'build/javascript/main.js', // Pfad zu Ihrem Einstiegsskript
   output: {
    file: 'dist/bundle.html', // Endergebnis: EINE Datei
    format: 'iife'
  },
  plugins: [
    url({
      include: ['**/*.woff', '**/*.woff2', '**/*.png', '**/*.jpg', '**/*.svg'],
      limit: 0
    }),
    css({ output: 'bundle.css' }),
    terser(),
    {
      name: 'single-html',
      generateBundle(options, bundle) {
        // JS-Code extrahieren
        const jsFile = Object.values(bundle).find(f => f.type === 'chunk')
        const jsCode = jsFile ? jsFile.code : ''

        // CSS-Code einlesen (vom Plugin erzeugt)
        let cssCode = ''
        const cssPath = path.join('dist', 'bundle.css')
        if (fs.existsSync(cssPath)) {
          cssCode = fs.readFileSync(cssPath, 'utf8')
          fs.unlinkSync(cssPath) // CSS-Datei wieder löschen
        }

        // HTML erzeugen
        const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mein Projekt</title>
<style>${cssCode}</style>
</head>
<body>
<div id="app"></div>
<script>${jsCode}</script>
</body>
</html>`

        // In dist/bundle.html schreiben
        this.emitFile({
          type: 'asset',
          fileName: 'bundle.html',
          source: html
        })
      }
    }
  ]
}
