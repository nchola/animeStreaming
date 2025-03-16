export default defineConfig({
  plugins: [
    laravel({
      input: 'resources/js/app.js',
      refresh: {
        paths: [
          'resources/views/**',
          'routes/**',
          'app/Http/Controllers/**'
        ]
      }
    }),
    vue({
      reactivityTransform: true,
      template: {
        compilerOptions: {
          // Bypass production checks
          isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }
    })
  ],
  optimizeDeps: {
    include: [
      '@vue/devtools-api'
    ]
  }
})