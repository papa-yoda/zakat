import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

function getRootEnv(): Record<string, string> {
  const envPath = path.resolve(__dirname, '../.env')
  if (!fs.existsSync(envPath)) return {}
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter(l => l.trim() && !l.startsWith('#') && l.includes('='))
      .map(l => l.split('=').map(s => s.trim()) as [string, string])
  )
}

const env = getRootEnv()
const backendPort = env.PORT ?? '8080'
const mode = process.env.VITE_MODE ?? 'full'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_MODE': JSON.stringify(mode),
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: mode === 'full' ? {
      '/api': `http://localhost:${backendPort}`
    } : undefined
  }
})
