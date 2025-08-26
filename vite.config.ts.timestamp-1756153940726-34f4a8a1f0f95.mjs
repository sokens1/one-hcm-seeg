// vite.config.ts
import { defineConfig } from "file:///E:/one-hcm/talent-flow-gabon-87/node_modules/vite/dist/node/index.js";
import react from "file:///E:/one-hcm/talent-flow-gabon-87/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///E:/one-hcm/talent-flow-gabon-87/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "E:\\one-hcm\\talent-flow-gabon-87";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Dev-only middleware to avoid 404 on /favicon.ico by serving the SVG
    mode === "development" && {
      name: "serve-favicon-ico",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === "/favicon.ico") {
            try {
              const svgPath = path.resolve(__vite_injected_original_dirname, "public", "favicon.svg");
              const fs = await import("fs");
              const data = fs.readFileSync(svgPath);
              res.setHeader("Content-Type", "image/svg+xml");
              res.statusCode = 200;
              res.end(data);
              return;
            } catch (e) {
            }
          }
          next();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxvbmUtaGNtXFxcXHRhbGVudC1mbG93LWdhYm9uLTg3XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxvbmUtaGNtXFxcXHRhbGVudC1mbG93LWdhYm9uLTg3XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9vbmUtaGNtL3RhbGVudC1mbG93LWdhYm9uLTg3L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gICAgLy8gRGV2LW9ubHkgbWlkZGxld2FyZSB0byBhdm9pZCA0MDQgb24gL2Zhdmljb24uaWNvIGJ5IHNlcnZpbmcgdGhlIFNWR1xyXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiB7XHJcbiAgICAgIG5hbWU6ICdzZXJ2ZS1mYXZpY29uLWljbycsXHJcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHJlcS51cmwgPT09ICcvZmF2aWNvbi5pY28nKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc3ZnUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnLCAnZmF2aWNvbi5zdmcnKTtcclxuICAgICAgICAgICAgICBjb25zdCBmcyA9IGF3YWl0IGltcG9ydCgnZnMnKTtcclxuICAgICAgICAgICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKHN2Z1BhdGgpO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdpbWFnZS9zdmcreG1sJyk7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChkYXRhKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAvLyBGYWxsIGJhY2sgdG8gbmV4dCBoYW5kbGVyIGlmIHJlYWQgZmFpbHNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbmV4dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFSLFNBQVMsb0JBQXdDO0FBQ3RVLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQTtBQUFBLElBRWhCLFNBQVMsaUJBQWlCO0FBQUEsTUFDeEIsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQXVCO0FBQ3JDLGVBQU8sWUFBWSxJQUFJLE9BQU8sS0FBSyxLQUFLLFNBQVM7QUFDL0MsY0FBSSxJQUFJLFFBQVEsZ0JBQWdCO0FBQzlCLGdCQUFJO0FBQ0Ysb0JBQU0sVUFBVSxLQUFLLFFBQVEsa0NBQVcsVUFBVSxhQUFhO0FBQy9ELG9CQUFNLEtBQUssTUFBTSxPQUFPLElBQUk7QUFDNUIsb0JBQU0sT0FBTyxHQUFHLGFBQWEsT0FBTztBQUNwQyxrQkFBSSxVQUFVLGdCQUFnQixlQUFlO0FBQzdDLGtCQUFJLGFBQWE7QUFDakIsa0JBQUksSUFBSSxJQUFJO0FBQ1o7QUFBQSxZQUNGLFNBQVMsR0FBRztBQUFBLFlBRVo7QUFBQSxVQUNGO0FBQ0EsZUFBSztBQUFBLFFBQ1AsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
