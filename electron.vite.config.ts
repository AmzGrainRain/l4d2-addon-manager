import { resolve } from 'path';
import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    main: {
        build: {
            rollupOptions: {
                input: resolve('./src/main/index.ts'),
                output: {
                    format: 'es',
                    entryFileNames: '[name].mjs',
                    chunkFileNames: '[name].mjs'
                }
            }
        }
    },
    preload: {
        build: {
            externalizeDeps: false,
            rollupOptions: {
                input: resolve('./src/preload/index.ts'),
                output: {
                    format: 'cjs',
                    entryFileNames: '[name].cjs',
                    chunkFileNames: '[name].cjs'
                }
            }
        }
    },
    renderer: {
        build: {
            rollupOptions: {
                input: resolve('./src/renderer/index.html')
            }
        },
        plugins: [vue(), tailwindcss({ optimize: { minify: true } })]
    }
});
