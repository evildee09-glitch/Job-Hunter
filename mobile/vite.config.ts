import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev-only proxies: avoid browser CORS problems when calling job APIs from localhost.
    proxy: {
      '/api/remotive': {
        target: 'https://remotive.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/remotive/, '/api/remote-jobs'),
      },
      '/api/wwr': {
        target: 'https://weworkremotely.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/wwr/, '/remote-jobs.rss'),
      },
      '/api/himalayas': {
        target: 'https://himalayas.app',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/himalayas/, '/jobs/api'),
      },
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
