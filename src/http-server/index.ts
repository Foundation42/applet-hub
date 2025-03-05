// http-server/index.ts
import {
  Module,
  ModuleContext,
  ModuleState,
  ServiceDefinition,
} from "../module-system/ModuleSystem";
import { serve, Server } from "bun";

/**
 * HTTP server configuration
 */
export interface HttpServerConfig {
  /**
   * Port to listen on
   * @default 3000
   */
  port: number;

  /**
   * Host to bind to
   * @default "localhost"
   */
  host: string;

  /**
   * Base path for the server
   * @default "/"
   */
  basePath: string;
}

/**
 * HTTP request handler
 */
export interface HttpRequestHandler {
  /**
   * Handle an HTTP request
   * @param request The request object
   * @param server The server instance
   * @returns A response or undefined if the request was not handled
   */
  handleRequest(
    request: Request,
    server: Server
  ): Promise<Response | undefined>;
}

/**
 * HTTP server service
 */
export interface HttpServerService {
  /**
   * Register a request handler
   * @param handler The request handler to register
   * @param priority The handler priority (higher numbers run first)
   * @returns A function to unregister the handler
   */
  registerHandler(handler: HttpRequestHandler, priority?: number): () => void;

  /**
   * Get the current server configuration
   */
  getConfig(): HttpServerConfig;

  /**
   * Set the server configuration
   * @param config The new configuration
   */
  setConfig(config: Partial<HttpServerConfig>): void;

  /**
   * Get the server instance
   */
  getServer(): Server | null;

  /**
   * Restart the server
   */
  restart(): Promise<boolean>;
}

/**
 * HTTP server module
 */
export class HttpServerModule implements Module {
  private context: ModuleContext | null = null;
  private state: ModuleState = ModuleState.REGISTERED;
  private config: HttpServerConfig = {
    port: 3000,
    host: "localhost",
    basePath: "/",
  };
  private server: Server | null = null;
  private handlers: Array<{ handler: HttpRequestHandler; priority: number }> =
    [];

  /**
   * Initialize the HTTP server module
   */
  async initialize(context: ModuleContext): Promise<boolean> {
    try {
      this.state = ModuleState.LOADING;
      this.context = context;

      // Load configuration from store if available
      const storedConfig = await context.store.get("config");
      if (storedConfig) {
        this.config = { ...this.config, ...storedConfig };
      }

      // Create the HTTP server service
      const service: HttpServerService = {
        registerHandler: this.registerHandler.bind(this),
        getConfig: this.getConfig.bind(this),
        setConfig: this.setConfig.bind(this),
        getServer: this.getServer.bind(this),
        restart: this.restart.bind(this),
      };

      // Register the HTTP server service
      const serviceDefinition: ServiceDefinition = {
        id: "httpServer",
        implementation: service,
        version: "1.0.0",
        metadata: {
          description: "HTTP server service",
        },
      };

      context.services.registerService(serviceDefinition);

      // Start the server
      await this.startServer();

      // Subscribe to configuration changes
      context.store.subscribe("config", async (newConfig) => {
        console.log("HTTP server configuration changed:", newConfig);
        this.config = { ...this.config, ...newConfig };
        await this.restart();
      });

      this.state = ModuleState.ACTIVE;
      return true;
    } catch (error) {
      console.error("Error initializing HTTP server module:", error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Stop the HTTP server module
   */
  async stop(): Promise<boolean> {
    try {
      if (this.server) {
        this.server.stop();
        this.server = null;
      }

      this.state = ModuleState.STOPPED;
      return true;
    } catch (error) {
      console.error("Error stopping HTTP server module:", error);
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
      id: "http-server",
      name: "HTTP Server",
      description: "Core HTTP server module for AppletHub",
      version: "1.0.0",
      entryPoint: "index.ts",
      capabilities: ["http-server"],
      dependencies: {},
    };
  }

  /**
   * Get the module API
   */
  getAPI(): Record<string, any> {
    return {};
  }

  /**
   * Start the HTTP server
   */
  private async startServer(): Promise<boolean> {
    try {
      if (this.server) {
        this.server.stop();
      }

      this.server = serve({
        port: this.config.port,
        hostname: this.config.host,
        fetch: this.handleRequest.bind(this),
      });

      console.log(
        `HTTP server started on http://${this.config.host}:${this.config.port}`
      );
      return true;
    } catch (error) {
      console.error("Error starting HTTP server:", error);
      return false;
    }
  }

  /**
   * Handle an HTTP request
   */
  private async handleRequest(
    request: Request,
    server: Server
  ): Promise<Response> {
    // Apply base path
    const url = new URL(request.url);
    const path = url.pathname;

    if (
      this.config.basePath !== "/" &&
      !path.startsWith(this.config.basePath)
    ) {
      return new Response("Not Found", { status: 404 });
    }

    // Sort handlers by priority (higher runs first)
    const sortedHandlers = [...this.handlers].sort(
      (a, b) => b.priority - a.priority
    );

    // Try each handler in order
    for (const { handler } of sortedHandlers) {
      try {
        const response = await handler.handleRequest(request, server);
        if (response) {
          return response;
        }
      } catch (error) {
        console.error("Error in HTTP request handler:", error);
      }
    }

    // Default response if no handler handled the request
    return new Response("Not Found", { status: 404 });
  }

  /**
   * Register a request handler
   */
  private registerHandler(
    handler: HttpRequestHandler,
    priority = 0
  ): () => void {
    this.handlers.push({ handler, priority });

    return () => {
      const index = this.handlers.findIndex((h) => h.handler === handler);
      if (index !== -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  /**
   * Get the current server configuration
   */
  private getConfig(): HttpServerConfig {
    return { ...this.config };
  }

  /**
   * Set the server configuration
   */
  private setConfig(config: Partial<HttpServerConfig>): void {
    this.config = { ...this.config, ...config };

    // Update store if context is available
    if (this.context) {
      this.context.store.set("config", this.config);
    }
  }

  /**
   * Get the server instance
   */
  private getServer(): Server | null {
    return this.server;
  }

  /**
   * Restart the server
   */
  private async restart(): Promise<boolean> {
    return this.startServer();
  }
}

/**
 * Create the HTTP server module
 */
export function createModule(): Module {
  return new HttpServerModule();
}
