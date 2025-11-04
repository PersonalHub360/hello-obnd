import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Vite logger will be created in setupVite function

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamically import vite and config only in development
  // This function is only called in development mode, so esbuild shouldn't bundle it
  const { createServer: createViteServer, createLogger: createViteLogger } = await import("vite");
  const viteLogger = createViteLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  // Import vite config dynamically - use eval to prevent static analysis by esbuild
  // This ensures the vite.config.ts file isn't analyzed during bundling
  let viteConfig: any;
  try {
    // Use a computed path to prevent static analysis
    const baseDir = import.meta.dirname || __dirname;
    const configPath = path.join(baseDir, "..", "vite.config.ts");
    // Use dynamic import with a computed string that esbuild can't statically analyze
    const configLoader = new Function("path", "return import(path)");
    const viteConfigModule = await configLoader(configPath);
    viteConfig = typeof viteConfigModule.default === 'function' 
      ? await viteConfigModule.default() 
      : (viteConfigModule.default || viteConfigModule);
  } catch (e) {
    // If vite config can't be loaded, create a minimal config
    const react = (await import("@vitejs/plugin-react")).default;
    viteConfig = {
      plugins: [react()],
    };
  }

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
