// rpc/index.ts
import {
  Module,
  ModuleContext,
  ModuleState,
  ServiceDefinition,
} from "@module-system/ModuleSystem";
import {
  WebSocketServerService,
  WebSocketMessageHandler,
  WebSocketConnection,
} from "@websocket-server";

/**
 * RPC request
 */
export interface RpcRequest {
  /**
   * JSON-RPC version
   */
  jsonrpc: string;

  /**
   * Request ID
   */
  id: string | number;

  /**
   * Method name
   */
  method: string;

  /**
   * Method parameters
   */
  params?: any;
}

/**
 * RPC response
 */
export interface RpcResponse {
  /**
   * JSON-RPC version
   */
  jsonrpc: string;

  /**
   * Request ID
   */
  id: string | number;

  /**
   * Result data (if successful)
   */
  result?: any;

  /**
   * Error data (if failed)
   */
  error?: string | { message: string; code: number; data?: any };
}

/**
 * RPC middleware function
 */
export type RpcMiddleware = (
  request: RpcRequest,
  context: {
    connection: WebSocketConnection;
    [key: string]: any;
  }
) => Promise<RpcResponse | void | { request?: RpcRequest; context?: any }>;

/**
 * RPC method handler
 */
export type RpcMethodHandler = (
  params: any,
  context: {
    connection: WebSocketConnection;
    [key: string]: any;
  }
) => Promise<any>;

/**
 * RPC service
 */
export interface RpcService {
  /**
   * Register an RPC method handler
   * @param method Method name
   * @param handler Method handler
   * @returns Function to unregister the handler
   */
  registerMethod(method: string, handler: RpcMethodHandler): () => void;

  /**
   * Register RPC middleware
   * @param middleware Middleware function
   * @returns Function to unregister the middleware
   */
  registerMiddleware(middleware: RpcMiddleware): () => void;

  /**
   * Call an RPC method from the server side
   * @param clientId Client ID to send the request to
   * @param method Method name
   * @param params Method parameters
   * @returns Promise that resolves with the response
   */
  callMethod(clientId: string, method: string, params?: any): Promise<any>;
}

/**
 * RPC module
 */
export class RpcModule implements Module {
  private context: ModuleContext | null = null;
  private state: ModuleState = ModuleState.REGISTERED;
  private wsService: WebSocketServerService | null = null;
  private methodHandlers: Map<string, RpcMethodHandler> = new Map();
  private middleware: RpcMiddleware[] = [];
  private pendingCalls: Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();
  private unregisterMessageHandler: (() => void) | null = null;
  private callId: number = 0;

  /**
   * Initialize the RPC module
   */
  async initialize(context: ModuleContext): Promise<boolean> {
    try {
      this.state = ModuleState.LOADING;
      this.context = context;

      // Get WebSocket server service
      this.wsService = context.services.getService(
        "websocketServer"
      ) as WebSocketServerService;
      if (!this.wsService) {
        console.error("WebSocket server service not found");
        this.state = ModuleState.ERROR;
        return false;
      }

      // Register message handler
      const messageHandler: WebSocketMessageHandler = {
        handleMessage: this.handleMessage.bind(this),
      };

      this.unregisterMessageHandler = this.wsService.registerMessageHandler(
        messageHandler,
        100
      );

      // Create the RPC service
      const service: RpcService = {
        registerMethod: this.registerMethod.bind(this),
        registerMiddleware: this.registerMiddleware.bind(this),
        callMethod: this.callMethod.bind(this),
      };

      // Register the RPC service
      const serviceDefinition: ServiceDefinition = {
        id: "rpc",
        implementation: service,
        version: "1.0.0",
        metadata: {
          description: "JSON-RPC over WebSockets",
        },
      };

      context.services.registerService(serviceDefinition);

      // Register system methods
      this.registerSystemMethods();

      this.state = ModuleState.ACTIVE;
      return true;
    } catch (error) {
      console.error("Error initializing RPC module:", error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Stop the RPC module
   */
  async stop(): Promise<boolean> {
    try {
      // Unregister message handler
      if (this.unregisterMessageHandler) {
        this.unregisterMessageHandler();
      }

      // Clear all pending calls
      for (const { reject, timeout } of this.pendingCalls.values()) {
        clearTimeout(timeout);
        reject(new Error("RPC module stopped"));
      }

      this.pendingCalls.clear();

      this.state = ModuleState.STOPPED;
      return true;
    } catch (error) {
      console.error("Error stopping RPC module:", error);
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
      id: "rpc",
      name: "RPC System",
      description: "JSON-RPC over WebSockets for AppletHub",
      version: "1.0.0",
      entryPoint: "index.ts",
      capabilities: ["rpc"],
      dependencies: {
        "websocket-server": "^1.0.0",
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
   * Handle a WebSocket message
   */
  private async handleMessage(
    connection: WebSocketConnection,
    message: string | ArrayBuffer
  ): Promise<boolean> {
    if (typeof message !== "string") {
      return false;
    }

    try {
      const request = JSON.parse(message) as RpcRequest;

      // Check if this is an RPC request
      if (!request.jsonrpc || !request.id || !request.method) {
        return false;
      }

      // Check if this is a response to a pending call
      if ("result" in request || "error" in request) {
        const pendingCall = this.pendingCalls.get(String(request.id));
        if (pendingCall) {
          this.pendingCalls.delete(String(request.id));
          clearTimeout(pendingCall.timeout);

          if ("error" in request) {
            pendingCall.reject(request.error);
          } else {
            pendingCall.resolve(request.result);
          }

          return true;
        }
      }

      // Process the request
      const response = await this.processRequest(request, connection);

      // Send the response
      if (this.wsService) {
        this.wsService.sendToClient(
          connection.clientId,
          JSON.stringify(response)
        );
      }

      return true;
    } catch (error) {
      console.error("Error handling RPC message:", error);
      return false;
    }
  }

  /**
   * Process an RPC request
   */
  private async processRequest(
    request: RpcRequest,
    connection: WebSocketConnection
  ): Promise<RpcResponse> {
    try {
      // Initialize context
      let context = { connection };

      // Run middleware
      for (const middleware of this.middleware) {
        try {
          const result = await middleware(request, context);

          // If middleware returns a response, return it immediately
          if (result && "jsonrpc" in result) {
            return result as RpcResponse;
          }

          // If middleware modifies request or context, update them
          if (result && (result.request || result.context)) {
            request = result.request || request;
            context = { ...context, ...(result.context || {}) };
          }
        } catch (error) {
          // If middleware throws, return error response
          return {
            jsonrpc: "2.0",
            id: request.id,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }

      // Find method handler
      const handler = this.methodHandlers.get(request.method);
      if (!handler) {
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: `Method ${request.method} not found`,
        };
      }

      // Call method handler
      const result = await handler(request.params || {}, context);

      // Return success response
      return {
        jsonrpc: "2.0",
        id: request.id,
        result,
      };
    } catch (error) {
      console.error(`Error processing RPC request ${request.method}:`, error);

      // Return error response
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Register an RPC method handler
   */
  private registerMethod(
    method: string,
    handler: RpcMethodHandler
  ): () => void {
    this.methodHandlers.set(method, handler);

    return () => {
      this.methodHandlers.delete(method);
    };
  }

  /**
   * Register RPC middleware
   */
  private registerMiddleware(middleware: RpcMiddleware): () => void {
    this.middleware.push(middleware);

    return () => {
      const index = this.middleware.indexOf(middleware);
      if (index !== -1) {
        this.middleware.splice(index, 1);
      }
    };
  }

  /**
   * Call an RPC method from the server side
   */
  private async callMethod(
    clientId: string,
    method: string,
    params?: any
  ): Promise<any> {
    if (!this.wsService) {
      throw new Error("WebSocket service not available");
    }

    // Check if client is connected
    const connection = this.wsService.getConnection(clientId);
    if (!connection) {
      throw new Error(`Client ${clientId} not connected`);
    }

    // Create request ID
    const id = String(++this.callId);

    // Create request
    const request: RpcRequest = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    // Create promise that will resolve when response is received
    const promise = new Promise((resolve, reject) => {
      // Create timeout for the call
      const timeout = setTimeout(() => {
        this.pendingCalls.delete(id);
        reject(new Error(`RPC call ${method} timed out`));
      }, 30000); // 30 second timeout

      // Store pending call
      this.pendingCalls.set(id, { resolve, reject, timeout });
    });

    // Send the request
    this.wsService.sendToClient(clientId, JSON.stringify(request));

    // Wait for response
    return promise;
  }

  /**
   * Register system methods
   */
  private registerSystemMethods(): void {
    // Register ping method
    this.registerMethod("system.ping", async () => {
      return { pong: true, time: Date.now() };
    });

    // Register echo method
    this.registerMethod("system.echo", async (params) => {
      return params;
    });

    // Register state methods if we have access to the tuple store
    if (this.context && this.context.store) {
      // Get state
      this.registerMethod("system.state.get", async (params) => {
        return this.context!.store.get(params.path);
      });

      // Set state
      this.registerMethod("system.state.set", async (params, context) => {
        // Check if client is authenticated
        if (!context.connection.authenticated) {
          throw new Error("Unauthorized: Authentication required");
        }

        return this.context!.store.set(params.path, params.value, {
          persistent: params.persistent || false,
        });
      });

      // Subscribe to state changes
      this.registerMethod("system.state.subscribe", async (params, context) => {
        // Store subscription in connection data
        if (!context.connection.data.subscriptions) {
          context.connection.data.subscriptions = new Set();
        }

        context.connection.data.subscriptions.add(params.path);

        // Set up subscription
        const unsubscribe = this.context!.store.subscribe(
          params.path,
          (newValue, oldValue, path) => {
            // Send notification to client
            if (this.wsService) {
              this.wsService.sendToClient(
                context.connection.clientId,
                JSON.stringify({
                  jsonrpc: "2.0",
                  method: "system.state.update",
                  params: {
                    path: path.join("."),
                    value: newValue,
                    oldValue,
                  },
                })
              );
            }
          }
        );

        // Store unsubscribe function
        if (!context.connection.data.unsubscribeFunctions) {
          context.connection.data.unsubscribeFunctions = new Map();
        }

        context.connection.data.unsubscribeFunctions.set(
          params.path,
          unsubscribe
        );

        return true;
      });

      // Unsubscribe from state changes
      this.registerMethod(
        "system.state.unsubscribe",
        async (params, context) => {
          // Check if client has subscriptions
          if (
            !context.connection.data.subscriptions ||
            !context.connection.data.unsubscribeFunctions
          ) {
            return false;
          }

          // Get unsubscribe function
          const unsubscribe = context.connection.data.unsubscribeFunctions.get(
            params.path
          );
          if (!unsubscribe) {
            return false;
          }

          // Call unsubscribe function
          unsubscribe();

          // Remove from connection data
          context.connection.data.subscriptions.delete(params.path);
          context.connection.data.unsubscribeFunctions.delete(params.path);

          return true;
        }
      );
    }

    // Register a middleware to handle authentication
    this.registerMiddleware(async (request, context) => {
      // Always allow system methods
      if (request.method.startsWith("system.")) {
        return;
      }

      // Check if client is authenticated
      if (!context.connection.authenticated) {
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: "Unauthorized: Authentication required",
        };
      }
    });
  }
}

/**
 * Create the RPC module
 */
export function createModule(): Module {
  return new RpcModule();
}
