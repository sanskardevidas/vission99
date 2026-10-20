import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiHandler } from './server/api/index.ts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Server-only secrets (never exposed to the browser bundle — no VITE_ prefix).
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [
      react(),
      { name: 'v99-api', configureServer: (server) => { server.middlewares.use(apiHandler); } },
    ],
  };
});
