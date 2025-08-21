import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Dev-only middleware to avoid 404 on /favicon.ico by serving the SVG
    mode === 'development' && {
      name: 'serve-favicon-ico',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/favicon.ico') {
            try {
              const svgPath = path.resolve(__dirname, 'public', 'favicon.svg');
              const fs = await import('fs');
              const data = fs.readFileSync(svgPath);
              res.setHeader('Content-Type', 'image/svg+xml');
              res.statusCode = 200;
              res.end(data);
              return;
            } catch (e) {
              // Fall back to next handler if read fails
            }
          }
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
