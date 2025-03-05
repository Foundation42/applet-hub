// websocket-server/index.ts
import {
  Module,
  ModuleContext,
  ModuleState,
  ServiceDefinition,
} from "../module-system/ModuleSystem";
import { HttpRequestHandler, HttpServerService } from "../http-server";
import { Server, ServerWebSocket, WebSocketHandler } from "bun";
import { randomBytes, createHmac } from "crypto";

/**
 * WebSocket connection
 */
export interface WebSocketConnection {
  /**
   * WebSocket instance
   */
  socket: ServerWebSocket;

  /**
   * Client ID
   */
  clientId: string;

  /**
   * Client IP address
   */
  clientIp: string;

  /**
   * Authentication scope
   */
  scope: string;

  /**
   * Whether the connection is authenticated
   */
  authenticated: boolean;

  /**
   * Custom data
   */
  data: Record<string, any>;
}

/**
 * WebSocket message handler
 */
export interface WebSocketMessageHandler {
  /**
   * Handle a WebSocket message
   * @param connection The WebSocket connection
   * @param message The message
   * @returns True if the message was handled
   */
  handleMessage(
    connection: WebSocketConnection,
    message: string | ArrayBuffer
  ): Promise<boolean>;
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  /**
   * Path to handle WebSocket connections on
   * @default "/ws"
   */
  path: string;

  /**
   * Whether to require authentication
   * @default true
   */
  requireAuth: boolean;

  /**
   * Secret key for authentication
   * @default "change-this-in-production"
   */
  secretKey: string;

  /**
   * Token expiry time in milliseconds
   * @default 900000 (15 minutes)
   */
  tokenExpiry: number;
}

/**
 * WebSocket server service
 */
export interface WebSocketServerService {
  /**
   * Register a message handler
   * @param handler The message handler
   * @param priority The handler priority (higher numbers run first)
   * @returns A function to unregister the handler
   */
  registerMessageHandler(
    handler: WebSocketMessageHandler,
    priority?: number
  ): () => void;

  /**
   * Send a message to a specific client
   * @param clientId The client ID
   * @param message The message
   * @returns True if the message was sent
   */
  sendToClient(clientId: string, message: string | object): boolean;

  /**
   * Send a message to all clients
   * @param message The message
   * @param filter Optional filter function
   */
  broadcast(
    message: string | object,
    filter?: (connection: WebSocketConnection) => boolean
  ): void;

  /**
   * Get all active connections
   */
  getConnections(): WebSocketConnection[];

  /**
   * Get connection by client ID
   */
  getConnection(clientId: string): WebSocketConnection | undefined;

  /**
   * Generate an authentication token
   * @param clientIp The client IP address
   * @param scope The authentication scope
   * @returns The authentication token
   */
  generateToken(clientIp: string, scope?: string): string;

  /**
   * Validate an authentication token
   * @param token The token to validate
   * @param clientIp The client IP address
   * @param requiredScope Optional required scope
   * @returns True if the token is valid
   */
  validateToken(
    token: string,
    clientIp: string,
    requiredScope?: string
  ): boolean;

  /**
   * Get the WebSocket configuration
   */
  getConfig(): WebSocketConfig;

  /**
   * Set the WebSocket configuration
   */
  setConfig(config: Partial<WebSocketConfig>): void;
}

/**
 * WebSocket server module
 */
export class WebSocketServerModule implements Module {
  private context: ModuleContext | null = null;
  private state: ModuleState = ModuleState.REGISTERED;
  private httpService: HttpServerService | null = null;
  private config: WebSocketConfig = {
    path: "/ws",
    requireAuth: true,
    secretKey: "change-this-in-production",
    tokenExpiry: 15 * 60 * 1000, // 15 minutes
  };
  private connections: Map<string, WebSocketConnection> = new Map();
  private handlers: Array<{
    handler: WebSocketMessageHandler;
    priority: number;
  }> = [];
  private tokens: Map<
    string,
    {
      clientIp: string;
      scope: string;
      expires: number;
    }
  > = new Map();
  private unregisterHttpHandler: (() => void) | null = null;

  /**
   * Initialize the WebSocket server module
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

      // Create the WebSocket handler
      const wsHandler: WebSocketHandler = {
        open: this.handleOpen.bind(this),
        message: this.handleMessage.bind(this),
        close: this.handleClose.bind(this),
        drain: () => {},
      };

      // Register the HTTP request handler
      const httpHandler: HttpRequestHandler = {
        handleRequest: this.handleHttpRequest.bind(this),
      };

      this.unregisterHttpHandler = this.httpService.registerHandler(
        httpHandler,
        100
      );

      // Create the WebSocket server service
      const service: WebSocketServerService = {
        registerMessageHandler: this.registerMessageHandler.bind(this),
        sendToClient: this.sendToClient.bind(this),
        broadcast: this.broadcast.bind(this),
        getConnections: this.getConnections.bind(this),
        getConnection: this.getConnection.bind(this),
        generateToken: this.generateToken.bind(this),
        validateToken: this.validateToken.bind(this),
        getConfig: this.getConfig.bind(this),
        setConfig: this.setConfig.bind(this),
      };

      // Register the WebSocket server service
      const serviceDefinition: ServiceDefinition = {
        id: "websocketServer",
        implementation: service,
        version: "1.0.0",
        metadata: {
          description: "WebSocket server service",
        },
      };

      context.services.registerService(serviceDefinition);

      // Subscribe to configuration changes
      context.store.subscribe("config", (newConfig) => {
        console.log("WebSocket server configuration changed:", newConfig);
        this.config = { ...this.config, ...newConfig };
      });

      this.state = ModuleState.ACTIVE;
      return true;
    } catch (error) {
      console.error("Error initializing WebSocket server module:", error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Stop the WebSocket server module
   */
  async stop(): Promise<boolean> {
    try {
      // Close all connections
      for (const connection of this.connections.values()) {
        connection.socket.close();
      }

      // Unregister HTTP handler
      if (this.unregisterHttpHandler) {
        this.unregisterHttpHandler();
      }

      this.state = ModuleState.STOPPED;
      return true;
    } catch (error) {
      console.error("Error stopping WebSocket server module:", error);
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
      id: "websocket-server",
      name: "WebSocket Server",
      description: "WebSocket server module for AppletHub",
      version: "1.0.0",
      entryPoint: "index.ts",
      capabilities: ["websocket-server"],
      dependencies: {
        "http-server": "^1.0.0",
      },
    };
  }

  /**
   * Get the module API
   */
  getAPI(): Record<string, any> {
    return {};
  }

  /**
   * Handle an HTTP request for WebSocket upgrade
   */
  private async handleHttpRequest(
    request: Request,
    server: Server
  ): Promise<Response | undefined> {
    const url = new URL(request.url);

    // Check if this is a WebSocket request on our path
    if (url.pathname !== this.config.path) {
      return undefined;
    }

    // Get client IP
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      server.requestIP(request)?.address ||
      "unknown";

    // Check authentication if required
    if (this.config.requireAuth) {
      const token = url.searchParams.get("token");

      if (!token || !this.validateToken(token, clientIp)) {
        return new Response("Unauthorized: Invalid or expired token", {
          status: 401,
        });
      }
    }

    // Generate a client ID
    const clientId = randomBytes(8).toString("hex");

    // Upgrade to WebSocket
    const success = server.upgrade(request, {
      data: {
        clientId,
        clientIp,
        authenticated: true,
        scope: "default",
        data: {},
      },
    });

    return success
      ? undefined
      : new Response("WebSocket upgrade failed", { status: 500 });
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(ws: ServerWebSocket<any>): void {
    const data = ws.data;

    // Create connection object
    const connection: WebSocketConnection = {
      socket: ws,
      clientId: data.clientId,
      clientIp: data.clientIp,
      authenticated: data.authenticated,
      scope: data.scope,
      data: data.data || {},
    };

    // Add to connections map
    this.connections.set(connection.clientId, connection);

    console.log(
      `WebSocket client connected: ${connection.clientId} (${connection.clientIp})`
    );
  }

  /**
   * Handle WebSocket message event
   */
  private async handleMessage(
    ws: ServerWebSocket<any>,
    message: string | ArrayBuffer
  ): Promise<void> {
    const connection = this.connections.get(ws.data.clientId);
    if (!connection) return;

    // Sort handlers by priority (higher runs first)
    const sortedHandlers = [...this.handlers].sort(
      (a, b) => b.priority - a.priority
    );

    // Try each handler in order
    for (const { handler } of sortedHandlers) {
      try {
        const handled = await handler.handleMessage(connection, message);
        if (handled) {
          return;
        }
      } catch (error) {
        console.error("Error in WebSocket message handler:", error);
      }
    }

    // No handler processed the message
    console.warn(`Unhandled WebSocket message from ${connection.clientId}`);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(ws: ServerWebSocket<any>): void {
    const clientId = ws.data.clientId;

    // Remove from connections map
    this.connections.delete(clientId);

    console.log(`WebSocket client disconnected: ${clientId}`);
  }

  /**
   * Register a message handler
   */
  private registerMessageHandler(
    handler: WebSocketMessageHandler,
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
   * Send a message to a specific client
   */
  private sendToClient(clientId: string, message: string | object): boolean {
    const connection = this.connections.get(clientId);
    if (!connection) return false;

    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);
    connection.socket.send(messageStr);

    return true;
  }

  /**
   * Send a message to all clients
   */
  private broadcast(
    message: string | object,
    filter?: (connection: WebSocketConnection) => boolean
  ): void {
    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);

    for (const connection of this.connections.values()) {
      if (!filter || filter(connection)) {
        connection.socket.send(messageStr);
      }
    }
  }

  /**
   * Get all active connections
   */
  private getConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection by client ID
   */
  private getConnection(clientId: string): WebSocketConnection | undefined {
    return this.connections.get(clientId);
  }

  /**
   * Generate an authentication token
   */
  private generateToken(clientIp: string, scope = "default"): string {
    const tokenId = randomBytes(16).toString("hex");
    const timestamp = Date.now();
    const expires = timestamp + this.config.tokenExpiry;

    const signature = createHmac("sha256", this.config.secretKey)
      .update(`${tokenId}:${timestamp}:${clientIp}:${scope}`)
      .digest("hex");

    const token = `${tokenId}:${timestamp}:${signature}`;

    this.tokens.set(tokenId, {
      clientIp,
      scope,
      expires,
    });

    // Set up token expiration
    setTimeout(() => {
      this.tokens.delete(tokenId);
    }, this.config.tokenExpiry);

    return token;
  }

  /**
   * Validate an authentication token
   */
  private validateToken(
    token: string,
    clientIp: string,
    requiredScope?: string
  ): boolean {
    if (!token) return false;

    const [tokenId, timestamp, signature] = token.split(":");

    const tokenData = this.tokens.get(tokenId);
    if (!tokenData) return false;

    const now = Date.now();
    if (now > tokenData.expires) {
      this.tokens.delete(tokenId);
      return false;
    }

    if (tokenData.clientIp !== clientIp) {
      console.log(
        `IP mismatch: token created with ${tokenData.clientIp}, request from ${clientIp}`
      );
      return false;
    }

    if (
      requiredScope &&
      tokenData.scope !== requiredScope &&
      tokenData.scope !== "admin"
    ) {
      console.log(
        `Scope mismatch: token scope ${tokenData.scope}, required ${requiredScope}`
      );
      return false;
    }

    const expectedSignature = createHmac("sha256", this.config.secretKey)
      .update(
        `${tokenId}:${timestamp}:${tokenData.clientIp}:${tokenData.scope}`
      )
      .digest("hex");

    return signature === expectedSignature;
  }

  /**
   * Get the WebSocket configuration
   */
  private getConfig(): WebSocketConfig {
    return { ...this.config };
  }

  /**
   * Set the WebSocket configuration
   */
  private setConfig(config: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...config };

    // Update store if context is available
    if (this.context) {
      this.context.store.set("config", this.config);
    }
  }
}

/**
 * Create the WebSocket server module
 */
export function createModule(): Module {
  return new WebSocketServerModule();
}
