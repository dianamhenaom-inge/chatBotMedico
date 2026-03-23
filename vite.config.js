import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
<<<<<<< HEAD
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
=======
    environment: 'happy-dom',
    globals: true,
>>>>>>> feature/pruebas-del-sistema
  },
})
