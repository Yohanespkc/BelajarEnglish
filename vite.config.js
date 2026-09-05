import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import net from 'net'

// Dual-port forwarder: allows opening in Chromium browsers that block port 6000 (X11) with ERR_UNSAFE_PORT
const dualPortPlugin = () => ({
  name: 'dual-port-proxy',
  configureServer(server) {
    try {
      const forwarder = net.createServer((socket) => {
        const client = net.connect(6000, '127.0.0.1');
        socket.pipe(client).pipe(socket);
        socket.on('error', () => {});
        client.on('error', () => {});
      });
      forwarder.listen(6006, () => {
        console.log('➜ Chrome-safe mirror active on http://localhost:6006');
      });
      forwarder.on('error', (err) => {
        console.warn('Dual-port mirror on 6006 could not start (likely port in use):', err.message);
      });
    } catch (e) {
      console.warn('Dual-port setup error:', e);
    }
  }
});

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), dualPortPlugin()],
  server: {
    port: 6000,
    host: true,
    proxy: {
      '/api/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
      },
    },
  },
})
