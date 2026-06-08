import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base 默认 '/'，GitHub Pages 部署时通过 --base=/runner-personality-h5/ 覆盖
export default defineConfig({
  plugins: [react()],
})
