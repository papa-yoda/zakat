import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Read PORT from the root .env so the dev proxy stays in sync with the backend
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

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': `http://localhost:${backendPort}`
    }
  }
})
