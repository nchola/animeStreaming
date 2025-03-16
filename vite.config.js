import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  define: {
    __VUE_PROD_DEVTOOLS__: true
  },
  plugins: [
    laravel({
      input: [
        'resources/css/app.css', 
        'resources/js/app.js'
      ],
      refresh: true,
    }),
    vue({
      template: {
        compilerOptions: {
          // Tambahkan opsi compiler jika diperlukan
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/resources/js',
      'ziggy-js': '/vendor/tightenco/ziggy/dist/vue.es.js'
    }
  },
  server: {
    hmr: {
      host: 'localhost',
      protocol: 'ws'
    },
    watch: {
      usePolling: true
    }
  }
});