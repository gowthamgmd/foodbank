import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic', // React 17+ automatic transform — no need for React in scope
        }),
    ],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://3.108.155.142:8080',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://3.108.155.142:8080',
                changeOrigin: true,
            },
        },
    },
});
