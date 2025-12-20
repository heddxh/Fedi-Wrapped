import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log("Loading env from:", process.cwd());
  console.log("GEMINI_API_KEY loaded:", env.GEMINI_API_KEY ? "YES (Length: " + env.GEMINI_API_KEY.length + ")" : "NO");

  return {
    // Base path for GitHub Pages - use repo name for project pages
    // Set to '/' for custom domain or user/org pages (username.github.io)
    base: '/Fedi-Wrapped/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      '__GEMINI_API_KEY__': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    }
  };
});

