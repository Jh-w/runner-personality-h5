import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages 部署在 /runner-personality-h5/ 路径下
export default defineConfig({
  base: '/runner-personality-h5/',
  plugins: [react()],
})
