import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/tarigma-event-viewer-gh-pages/',
  build: { //add this property
    sourcemap: true,
},
})
