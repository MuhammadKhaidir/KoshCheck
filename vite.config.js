import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Saat `npm run dev`, Vercel Functions tidak jalan. Plugin ini menjalankan api/chat.js lewat Vite.
// Di production (Vercel), file api/chat.js dipakai langsung.
function devChatApi(env) {
  return {
    name: 'dev-chat-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        let status = 405
        let data = { error: 'Gunakan POST.' }
        try {
          if (req.method === 'POST') {
            let raw = ''
            for await (const part of req) {
              raw += part
              if (raw.length > 64_000) {
                status = 413
                data = { error: 'Pesan terlalu panjang.' }
                break
              }
            }
            if (status !== 413) {
              let body
              try {
                body = JSON.parse(raw)
              } catch {
                status = 400
                data = { error: 'Format JSON tidak valid.' }
              }
              if (body !== undefined) {
                const file = pathToFileURL(path.resolve(server.config.root, 'api/chat.js')).href + `?t=${Date.now()}`
                ;({ status, data } = await (await import(file)).chat(body, env))
              }
            }
          }
        } catch (error) {
          server.config.logger.error(`[dev-chat-api] ${error.message}`)
          status = 500
          data = { error: 'API lokal gagal memproses permintaan.' }
        }
        res.statusCode = status
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(data))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devChatApi(loadEnv(mode, process.cwd(), ''))],
}))
