import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; 

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') 
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
