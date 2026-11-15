import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Saat `npm run dev`, Vercel Functions tidak jalan. Plugin ini menjalankan file di folder api/ lewat Vite.
// Di production (Vercel), file api/*.js dipakai langsung.
// (api/pay-notify.js tidak ada di sini: Midtrans tidak bisa memanggil localhost. Uji setelah deploy.)
// Fungsi dipanggil sebagai fn(body, env, req). `method` bawaan POST.
const DEV_API = {
  '/api/chat': { file: 'api/chat.js', fn: 'chat' },
  '/api/pay': { file: 'api/pay.js', fn: 'createPayment' },
  '/api/orders': { file: 'api/orders.js', fn: 'createOrder' },
  '/api/pay-dummy': { file: 'api/pay-dummy.js', fn: 'dummyPay' },
  '/api/listings': { file: 'api/listings.js', fn: 'createListing' },
  '/api/admin': { file: 'api/admin.js', fn: 'listData', method: 'GET' },
}

function devApi(env) {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const [route, { file, fn, method = 'POST' }] of Object.entries(DEV_API)) {
        server.middlewares.use(route, async (req, res) => {
          let status = 405
          let data = { error: `Gunakan ${method}.` }
          if (req.method === method) {
            let body = {}
            if (method === 'POST') {
              let raw = ''
              for await (const part of req) raw += part
              try {
                body = JSON.parse(raw)
              } catch {
                /* body kosong atau bukan JSON */
              }
            }
            const url = pathToFileURL(path.resolve(file)).href + `?t=${Date.now()}`
            ;({ status, data } = await (await import(url))[fn](body, env, req))
          }
          res.statusCode = status
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(data))
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(loadEnv(mode, process.cwd(), ''))],
}))
