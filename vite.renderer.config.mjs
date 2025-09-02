import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Load .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  root: path.resolve('./src'),
  build: {
    outDir: path.resolve('./.vite/renderer/main_window'),
    emptyOutDir: true,
  },
  define: {
    global: 'globalThis',
    'process.env': JSON.stringify(env),
    'import.meta.env.VITE_DATABASE_URL': JSON.stringify(env.VITE_DATABASE_URL),
    'import.meta.env.VITE_CONTENTFUL_SPACE_ID': JSON.stringify(env.VITE_CONTENTFUL_SPACE_ID),
    'import.meta.env.VITE_CONTENTFUL_ENVIRONMENT_ID': JSON.stringify(env.VITE_CONTENTFUL_ENVIRONMENT_ID),
    'import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN': JSON.stringify(env.VITE_CONTENTFUL_ACCESS_TOKEN),
  },
});
