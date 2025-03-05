// static-files/index.ts
import {
  Module,
  ModuleContext,
  ModuleState,
} from "../module-system/ModuleSystem";
import { HttpRequestHandler, HttpServerService } from "../http-server";
import { Server } from "bun";
import { join, extname, resolve, normalize } from "path";
import { existsSync, statSync, readFileSync } from "fs";

/**
 * Static files configuration
 */
export interface StaticFilesConfig {
  /**
   * Base URL path for static files
   * @default "/static"
   */
  urlPath: string;

  /**
   * Base directory for static files
   * @default "./public"
   */
  baseDir: string;

  /**
   * Default index files
   * @default ["index.html", "index.htm"]
   */
  indexFiles: string[];

  /**
   * Cache control header value
   * @default "max-age=3600"
   */
  cacheControl: string;

  /**
   * File extension to MIME type mapping
   */
  mimeTypes: Record<string, string>;
}

/**
 * Static files module
 */
export class StaticFilesModule implements Module {
  private context: ModuleContext | null = null;
  private state: ModuleState = ModuleState.REGISTERED;
  private httpService: HttpServerService | null = null;
  private config: StaticFilesConfig = {
    urlPath: "/static",
    baseDir: "./public",
    indexFiles: ["index.html", "index.htm"],
    cacheControl: "max-age=3600",
    mimeTypes: {
      ".html": "text/html",
      ".htm": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".txt": "text/plain",
      // Full list omitted for brevity
    },
  };
  private unregisterHttpHandler: (() => void) | null = null;

  /**
   * Initialize the static files module
   */
  async initialize(context: ModuleContext): Promise<boolean> {
    try {
      this.state = ModuleState.LOADING;
      this.context = context;

      // Get HTTP server service
      this.httpService = context.services.getService(
        "httpServer"
      ) as HttpServerService;
      if (!this.httpService) {
        console.error("HTTP server service not found");
        this.state = ModuleState.ERROR;
        return false;
      }

      // Load configuration from store if available
      const storedConfig = await context.store.get("config");
      if (storedConfig) {
        this.config = { ...this.config, ...storedConfig };
      }

      // Register the HTTP request handler
      const httpHandler: HttpRequestHandler = {
        handleRequest: this.handleRequest.bind(this),
      };

      this.unregisterHttpHandler = this.httpService.registerHandler(
        httpHandler,
        50
      );

      // Subscribe to configuration changes
      context.store.subscribe("config", (newConfig) => {
        this.config = { ...this.config, ...newConfig };
      });

      this.state = ModuleState.ACTIVE;
      return true;
    } catch (error) {
      console.error("Error initializing static files module:", error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Stop the static files module
   */
  async stop(): Promise<boolean> {
    try {
      // Unregister HTTP handler
      if (this.unregisterHttpHandler) {
        this.unregisterHttpHandler();
      }

      this.state = ModuleState.STOPPED;
      return true;
    } catch (error) {
      console.error("Error stopping static files module:", error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Get the module state
   */
  getState(): ModuleState {
    return this.state;
  }

  /**
   * Get the module manifest
   */
  getManifest(): any {
    return {
      id: "static-files",
      name: "Static Files",
      description: "Static file serving module for AppletHub",
      version: "1.0.0",
      entryPoint: "index.ts",
      capabilities: ["static-files"],
      dependencies: {
        "http-server": "^1.0.0",
      },
    };
  }

  /**
   * Get the module API
   */
  getAPI(): Record<string, any> {
    return {
      getConfig: () => ({ ...this.config }),
      setConfig: (config: Partial<StaticFilesConfig>) => {
        this.config = { ...this.config, ...config };
        if (this.context) {
          this.context.store.set("config", this.config);
        }
      },
    };
  }

  /**
   * Handle an HTTP request for static files
   */
  private async handleRequest(
    request: Request,
    server: Server
  ): Promise<Response | undefined> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Check if this is a request for static files
    if (!path.startsWith(this.config.urlPath)) {
      return undefined;
    }

    // Get the relative path from the URL
    const relativePath = path.slice(this.config.urlPath.length);

    // Normalize and resolve the file path
    const normalizedPath = normalize(relativePath).replace(
      /^(\.\.(\/|\\|$))+/,
      ""
    );
    const filePath = resolve(this.config.baseDir, normalizedPath);

    // Check if the file exists
    if (!existsSync(filePath)) {
      return undefined;
    }

    // Check if it's a directory
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      // Try to serve an index file
      for (const indexFile of this.config.indexFiles) {
        const indexPath = join(filePath, indexFile);
        if (existsSync(indexPath)) {
          const content = readFileSync(indexPath);
          const contentType = this.getMimeType(indexPath);

          return new Response(content, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": this.config.cacheControl,
            },
          });
        }
      }

      // No index file found
      return new Response("Directory listing not enabled", { status: 403 });
    }

    // Serve the file
    const content = readFileSync(filePath);
    const contentType = this.getMimeType(filePath);

    return new Response(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": this.config.cacheControl,
      },
    });
  }

  /**
   * Get the MIME type for a file
   */
  private getMimeType(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    return this.config.mimeTypes[ext] || "application/octet-stream";
  }
}

/**
 * Create the static files module
 */
export function createModule(): Module {
  return new StaticFilesModule();
}
