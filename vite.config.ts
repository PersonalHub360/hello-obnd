import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Conditionally import Replit plugins only in development
const getReplitPlugins = async () => {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  
  const plugins = [];
  
  // Runtime error overlay (only in development)
  try {
    const runtimeErrorOverlay = (await import("@replit/vite-plugin-runtime-error-modal")).default;
    plugins.push(runtimeErrorOverlay());
  } catch (e) {
    // Plugin not available, skip it
  }
  
  // Other Replit plugins (only if REPL_ID is set)
  if (process.env.REPL_ID !== undefined) {
    try {
      const cartographer = (await import("@replit/vite-plugin-cartographer")).then((m) => m.cartographer());
      const devBanner = (await import("@replit/vite-plugin-dev-banner")).then((m) => m.devBanner());
      plugins.push(await cartographer, await devBanner);
    } catch (e) {
      // Plugins not available, skip them
    }
  }
  
  return plugins;
};

export default defineConfig(async () => {
  const replitPlugins = await getReplitPlugins();
  
  return {
    plugins: [
      react(),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
