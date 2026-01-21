import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Плагин для копирования JSON файлов в build/json после сборки
const copyJsonPlugin = () => {
  return {
    name: 'copy-json-files',
    closeBundle() {
      const publicJsonDir = join(process.cwd(), 'public', 'json')
      const buildJsonDir = join(process.cwd(), 'build', 'json')
      
      // Создаем директорию build/json если её нет
      if (!existsSync(buildJsonDir)) {
        mkdirSync(buildJsonDir, { recursive: true })
      }
      
      // Копируем файлы из public/json в build/json
      const files = ['gameItems.json', 'statistics.json']
      files.forEach(file => {
        const src = join(publicJsonDir, file)
        const dest = join(buildJsonDir, file)
        if (existsSync(src)) {
          copyFileSync(src, dest)
          console.log(`✅ Скопирован ${file} в build/json/`)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), copyJsonPlugin()],
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  publicDir: 'public',
})
