import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev middleware to serve /api/* without needing `vercel dev` — uses same api/* logic via dynamic import
function vizaraApiPlugin() {
  return {
    name: 'vizara-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()
        // normalize url (strip query)
        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        // helper to read body
        const readBody = () => new Promise((resolve) => {
          let data = ''
          req.on('data', (c) => (data += c))
          req.on('end', () => {
            if (!data) return resolve({})
            try { resolve(JSON.parse(data)) } catch { resolve({}) }
          })
        })

        // Map /api/register -> api/register.js etc.
        const routeMap = {
          '/api/register': () => import('./api/register.js'),
          '/api/login': () => import('./api/login.js'),
          '/api/me': () => import('./api/me.js'),
          '/api/logout': () => import('./api/logout.js'),
          '/api/request-reset': () => import('./api/request-reset.js'),
          '/api/reset-password': () => import('./api/reset-password.js'),
          '/api/send-reset-email': () => import('./api/send-reset-email.js'),
        }
        // also support /api/request-reset with alias /api/request-reset etc.
        const importer = routeMap[pathname]
        if (!importer) return next()

        try {
          const mod = await importer()
          const handler = mod.default
          // ensure req.body is populated for serverless handlers that expect req.body
          if (req.method === 'POST' || req.method === 'PUT') {
            const body = await readBody()
            req.body = body
          }
          // attach url with search for token extraction
          req.url = url.pathname + url.search
          // provide minimal Vercel-like res helpers if missing (status/json)
          const origStatus = res.statusCode
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return res
          }
          // call handler
          await handler(req, res)
          if (!res.writableEnded) res.end()
        } catch (e) {
          console.error('[vizara api middleware]', pathname, e)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Server error' }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), vizaraApiPlugin()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})