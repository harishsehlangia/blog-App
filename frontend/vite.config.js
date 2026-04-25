import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libraries into separate cached chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          'vendor-editor': [
            '@editorjs/editorjs',
            '@editorjs/header',
            '@editorjs/image',
            '@editorjs/list',
            '@editorjs/quote',
            '@editorjs/embed',
            '@editorjs/code',
            '@editorjs/link',
            '@editorjs/inline-code',
            '@editorjs/marker',
          ],
          'vendor-axios': ['axios'],
        },
      },
    },
  },
})
