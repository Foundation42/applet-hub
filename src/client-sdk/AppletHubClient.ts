// src/client-sdk/AppletHubClient.ts
/**
 * AppletHub Client SDK
 *
 * This provides the core client for connecting to an AppletHub server.
 */

/**
 * Configuration options for the AppletHub client
 */
export interface AppletHubClientOptions {
  /**
   * Server URL
   * @default "http://localhost:3000"
   */
  serverUrl?: string;

  /**
   * WebSocket URL (defaults to replacing http with ws in serverUrl)
   */
  wsUrl?: string;

  /**
   * Authentication token (if already available)
   */
  token?: string;

  /**
   * Automatically reconnect on disconnect
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Time between reconnection attempts in ms
   * @default 5000
   */
  reconnectInterval?: number;

  /**
   * Maximum reconnection attempts (0 for infinite)
   * @default 0
   */
  maxReconnectAttempts?: number;

  /**
   * RPC timeout in milliseconds
   * @default 30000
   */
  rpcTimeout?: number;

  /**
   * Event handlers
   */
  handlers?: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
    onReconnect?: () => void;
  };
}

/**
 * Status of the AppletHub client connection
 */
export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

/**
 * RPC request payload
 */
interface RpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: any;
}

/**
 * RPC response payload
 */
interface RpcResponse {
  jsonrpc: string;
  id: number | string;
  result?: any;
  error?: any;
}

/**
 * Event emitter interface for type-safe events
 */
export interface EventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void;
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  once<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}

/**
 * Create a simple event emitter
 */
export function createEventEmitter<
  T extends Record<string, any>
>(): EventEmitter<T> {
  const listeners: Record<string, Set<(data: any) => void>> = {};

  return {
    on<K extends keyof T>(
      event: K,
      listener: (data: T[K]) => void
    ): () => void {
      if (!listeners[event as string]) {
        listeners[event as string] = new Set();
      }
      listeners[event as string].add(listener);

      return () => {
        this.off(event, listener);
      };
    },

    off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
      if (listeners[event as string]) {
        listeners[event as string].delete(listener);
      }
    },

    once<K extends keyof T>(
      event: K,
      listener: (data: T[K]) => void
    ): () => void {
      const onceListener = (data: T[K]) => {
        listener(data);
        this.off(event, onceListener);
      };

      return this.on(event, onceListener);
    },

    emit<K extends keyof T>(event: K, data: T[K]): void {
      if (listeners[event as string]) {
        for (const listener of Array.from(listeners[event as string])) {
          try {
            listener(data);
          } catch (error) {
            console.error(
              `Error in event listener for "${String(event)}":`,
              error
            );
          }
        }
      }
    },
  };
}

/**
 * AppletHub client events
 */
export interface AppletHubClientEvents {
  connect: void;
  disconnect: void;
  error: Error;
  reconnect: void;
  status: ConnectionStatus;
  "state:change": { path: string; value: any; oldValue: any };
}

/**
 * Main AppletHub client class
 */
export class AppletHubClient {
  private options: Required<AppletHubClientOptions>;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private rpcCallId = 0;
  private pendingCalls: Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
      timeout: any;
    }
  > = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private stateSubscriptions: Map<
    string,
    Set<(newValue: any, oldValue: any, path: string) => void>
  > = new Map();
  private events: EventEmitter<AppletHubClientEvents>;

  /**
   * Create a new AppletHub client
   */
  constructor(options: AppletHubClientOptions = {}) {
    // Set default options
    this.options = {
      serverUrl: options.serverUrl || "http://localhost:3000",
      wsUrl:
        options.wsUrl ||
        this.getDefaultWsUrl(options.serverUrl || "http://localhost:3000"),
      token: options.token || null,
      autoReconnect: options.autoReconnect !== false,
      reconnectInterval: options.reconnectInterval || 5000,
      maxReconnectAttempts: options.maxReconnectAttempts || 0,
      rpcTimeout: options.rpcTimeout || 30000,
      handlers: options.handlers || {},
    };

    // Initialize token
    this.token = this.options.token || null;

    // Create event emitter
    this.events = createEventEmitter<AppletHubClientEvents>();

    // Register handlers
    if (this.options.handlers.onConnect) {
      this.events.on("connect", this.options.handlers.onConnect);
    }

    if (this.options.handlers.onDisconnect) {
      this.events.on("disconnect", this.options.handlers.onDisconnect);
    }

    if (this.options.handlers.onError) {
      this.events.on("error", this.options.handlers.onError);
    }

    if (this.options.handlers.onReconnect) {
      this.events.on("reconnect", this.options.handlers.onReconnect);
    }
  }

  /**
   * Get the default WebSocket URL from the server URL
   */
  private getDefaultWsUrl(serverUrl: string): string {
    return serverUrl.replace(/^http/, "ws") + "/ws";
  }

  /**
   * Set the connection status and emit events
   */
  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.events.emit("status", status);
  }

  /**
   * Get the current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Connect to the AppletHub server
   */
  async connect(): Promise<boolean> {
    // Don't connect if already connected or connecting
    if (
      this.status === ConnectionStatus.CONNECTED ||
      this.status === ConnectionStatus.CONNECTING
    ) {
      return true;
    }

    // Close existing connection if any
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus(ConnectionStatus.CONNECTING);

    // If we don't have a token, try to get one
    if (!this.token) {
      try {
        this.token = await this.fetchToken();
      } catch (error) {
        this.setStatus(ConnectionStatus.ERROR);
        this.events.emit(
          "error",
          error instanceof Error ? error : new Error(String(error))
        );
        return false;
      }
    }

    // Connect to WebSocket
    try {
      const wsUrl = `${this.options.wsUrl}?token=${this.token}`;
      this.ws = new WebSocket(wsUrl);

      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);

      // Wait for connection
      return new Promise<boolean>((resolve) => {
        const onConnect = () => {
          this.events.off("connect", onConnect);
          this.events.off("error", onError);
          resolve(true);
        };

        const onError = (error: Error) => {
          this.events.off("connect", onConnect);
          this.events.off("error", onError);
          resolve(false);
        };

        this.events.on("connect", onConnect);
        this.events.on("error", onError);
      });
    } catch (error) {
      this.setStatus(ConnectionStatus.ERROR);
      this.events.emit(
        "error",
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Disconnect from the AppletHub server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Fetch an authentication token from the server
   */
  private async fetchToken(): Promise<string> {
    const response = await fetch(`${this.options.serverUrl}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.token;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.setStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;
    this.events.emit("connect", undefined);

    // Resubscribe to state
    this.resubscribeToState();
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(): void {
    this.setStatus(ConnectionStatus.DISCONNECTED);
    this.events.emit("disconnect", undefined);

    // Reject all pending calls
    for (const { reject, timeout } of this.pendingCalls.values()) {
      clearTimeout(timeout);
      reject(new Error("Connection closed"));
    }

    this.pendingCalls.clear();

    // Reconnect if enabled
    if (this.options.autoReconnect) {
      this.reconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    this.setStatus(ConnectionStatus.ERROR);
    this.events.emit("error", new Error("WebSocket error"));
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);

      // Handle RPC response
      if (message.jsonrpc === "2.0" && message.id !== undefined) {
        this.handleRpcResponse(message);
        return;
      }

      // Handle state update notification
      if (
        message.jsonrpc === "2.0" &&
        message.method === "system.state.update"
      ) {
        this.handleStateUpdate(message.params);
        return;
      }

      // Handle other notifications
      // ...
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  /**
   * Handle an RPC response
   */
  private handleRpcResponse(response: RpcResponse): void {
    const id = String(response.id);
    const pendingCall = this.pendingCalls.get(id);

    if (pendingCall) {
      this.pendingCalls.delete(id);
      clearTimeout(pendingCall.timeout);

      if ("error" in response) {
        pendingCall.reject(response.error);
      } else {
        pendingCall.resolve(response.result);
      }
    }
  }

  /**
   * Handle a state update notification
   */
  private handleStateUpdate(update: {
    path: string;
    value: any;
    oldValue: any;
  }): void {
    // Emit general state change event
    this.events.emit("state:change", update);

    // Find matching subscriptions
    for (const [pattern, callbacks] of this.stateSubscriptions.entries()) {
      if (this.pathMatchesPattern(update.path, pattern)) {
        for (const callback of callbacks) {
          try {
            callback(update.value, update.oldValue, update.path);
          } catch (error) {
            console.error(
              `Error in state subscription callback for ${pattern}:`,
              error
            );
          }
        }
      }
    }
  }

  /**
   * Check if a path matches a pattern
   */
  private pathMatchesPattern(path: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\./g, "\\.") // Escape dots
      .replace(/\*\*/g, ".*") // ** matches any segments
      .replace(/\*/g, "[^.]+"); // * matches one segment

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Reconnect to the AppletHub server
   */
  private reconnect(): void {
    // Check max reconnect attempts
    if (
      this.options.maxReconnectAttempts > 0 &&
      this.reconnectAttempts >= this.options.maxReconnectAttempts
    ) {
      console.warn("Max reconnect attempts reached");
      return;
    }

    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.setStatus(ConnectionStatus.RECONNECTING);
    this.reconnectAttempts++;

    // Set up reconnect timer
    this.reconnectTimer = setTimeout(async () => {
      try {
        const success = await this.connect();

        if (success) {
          this.events.emit("reconnect", undefined);
        } else {
          this.reconnect();
        }
      } catch (error) {
        console.error("Error reconnecting:", error);
        this.reconnect();
      }
    }, this.options.reconnectInterval);
  }

  /**
   * Call an RPC method
   */
  async call<T = any>(method: string, params?: any): Promise<T> {
    if (!this.ws || this.status !== ConnectionStatus.CONNECTED) {
      throw new Error("Not connected");
    }

    // Create request ID
    const id = String(++this.rpcCallId);

    // Create request
    const request: RpcRequest = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    // Create promise that will resolve when response is received
    const promise = new Promise<T>((resolve, reject) => {
      // Create timeout for the call
      const timeout = setTimeout(() => {
        this.pendingCalls.delete(id);
        reject(new Error(`RPC call ${method} timed out`));
      }, this.options.rpcTimeout);

      // Store pending call
      this.pendingCalls.set(id, { resolve, reject, timeout });

      // Send the request
      this.ws!.send(JSON.stringify(request));
    });

    return promise;
  }

  /**
   * Subscribe to state changes
   */
  async subscribeToState(
    path: string,
    callback: (newValue: any, oldValue: any, path: string) => void
  ): Promise<() => void> {
    // Subscribe on the server
    await this.call("system.state.subscribe", { path });

    // Store subscription locally
    if (!this.stateSubscriptions.has(path)) {
      this.stateSubscriptions.set(path, new Set());
    }

    this.stateSubscriptions.get(path)!.add(callback);

    // Return unsubscribe function
    return async () => {
      // Remove local subscription
      const callbacks = this.stateSubscriptions.get(path);
      if (callbacks) {
        callbacks.delete(callback);

        if (callbacks.size === 0) {
          this.stateSubscriptions.delete(path);

          // Unsubscribe on the server
          try {
            await this.call("system.state.unsubscribe", { path });
          } catch (error) {
            console.error(`Error unsubscribing from ${path}:`, error);
          }
        }
      }
    };
  }

  /**
   * Resubscribe to all state subscriptions
   */
  private async resubscribeToState(): Promise<void> {
    for (const path of this.stateSubscriptions.keys()) {
      try {
        await this.call("system.state.subscribe", { path });
      } catch (error) {
        console.error(`Error resubscribing to ${path}:`, error);
      }
    }
  }

  /**
   * Get state value
   */
  async getState<T = any>(path: string): Promise<T> {
    return this.call<T>("system.state.get", { path });
  }

  /**
   * Set state value
   */
  async setState(
    path: string,
    value: any,
    persistent = false
  ): Promise<boolean> {
    return this.call<boolean>("system.state.set", {
      path,
      value,
      persistent,
    });
  }

  /**
   * Register event listener
   */
  on<K extends keyof AppletHubClientEvents>(
    event: K,
    listener: (data: AppletHubClientEvents[K]) => void
  ): () => void {
    return this.events.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof AppletHubClientEvents>(
    event: K,
    listener: (data: AppletHubClientEvents[K]) => void
  ): void {
    this.events.off(event, listener);
  }

  /**
   * Register one-time event listener
   */
  once<K extends keyof AppletHubClientEvents>(
    event: K,
    listener: (data: AppletHubClientEvents[K]) => void
  ): () => void {
    return this.events.once(event, listener);
  }
}

// Default export
export default AppletHubClient;
