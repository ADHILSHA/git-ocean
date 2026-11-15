import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import path from 'node:path'

/**
 * Serves api/github.ts at /api/github during `pnpm dev`, so the edge function
 * runs locally without the Vercel CLI. Production uses Vercel's edge runtime.
 */
function edgeApiInDev(): Plugin {
  return {
    name: 'git-ocean-edge-api',
    configureServer(server) {
      server.middlewares.use('/api/github', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/github.ts')
          const request = new Request(new URL(req.originalUrl ?? req.url ?? '/', 'http://localhost'))
          const response: Response = await mod.default(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(await response.text())
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // GITHUB_TOKEN / GITHUB_PROVIDER may live in git-ocean/.env or frontend/.env.
  const env = { ...loadEnv(mode, path.resolve(__dirname, '..'), ''), ...loadEnv(mode, __dirname, '') }
  for (const key of ['GITHUB_TOKEN', 'GITHUB_PROVIDER']) if (env[key] && !process.env[key]) process.env[key] = env[key]

  return {
    plugins: [react(), glsl({ compress: false }), edgeApiInDev()],
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          // The 3D stack changes rarely; keep it in its own long-cached chunk.
          manualChunks: { three: ['three'], r3f: ['@react-three/fiber', '@react-three/postprocessing', 'postprocessing'] },
        },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
    },
  }
})
