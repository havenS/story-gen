import path from "path"
import { defineConfig } from 'vite'
import dns from 'dns'
import react from '@vitejs/plugin-react-swc'

dns.setDefaultResultOrder('verbatim')
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // host: 'localhost', // Permet à Vite d'écouter sur toutes les interfaces réseau
    port: 5180       // Assurez-vous que cela correspond bien au port configuré dans docker-compose.yml
  }
})
