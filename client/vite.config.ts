import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../server', ''); //.env will always be loaded from server folder
  const port = env.PORT || '8888';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': `http://localhost:${port}`,
      },
    },
  };
});
