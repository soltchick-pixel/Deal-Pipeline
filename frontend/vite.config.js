import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Proxy all API calls from the React dev server to the Python backend
  server: {
    port: 5173,
    proxy: {
      '/deals':    { target: 'http://localhost:8000', changeOrigin: true },
      '/stats':    { target: 'http://localhost:8000', changeOrigin: true },
      '/followups':{ target: 'http://localhost:8000', changeOrigin: true },
    },
  },

  // When building for production, output goes into backend/static
  // so FastAPI can serve it directly
  build: {
    outDir: '../backend/static',
    emptyOutDir: true,
  },
})
