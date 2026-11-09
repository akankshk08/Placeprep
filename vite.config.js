import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Content Security Policy for the deployed site. GitHub Pages can't set
// response headers, so it goes in a <meta> tag. Only added to production
// builds because the dev server needs inline scripts.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://generativelanguage.googleapis.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const cspPlugin = {
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`
    )
  },
}

export default defineConfig({
  plugins: [react(), cspPlugin],
  base: '/Placeprep/',
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})
