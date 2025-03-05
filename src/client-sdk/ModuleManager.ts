// src/client-sdk/ModuleManager.ts
/**
 * AppletHub Client Module Management
 *
 * This provides client-side module management capabilities.
 */

import AppletHubClient from "./AppletHubClient";

/**
 * Module description
 */
export interface ModuleInfo {
  /**
   * Module ID
   */
  id: string;

  /**
   * Module name
   */
  name: string;

  /**
   * Module description
   */
  description?: string;

  /**
   * Module version
   */
  version: string;

  /**
   * Module author
   */
  author?: string;

  /**
   * Module capabilities
   */
  capabilities?: string[];

  /**
   * Module slots
   */
  slots?: string[];

  /**
   * Module dependencies
   */
  dependencies?: Record<string, string>;
}

/**
 * Client-side module instance
 */
export interface ClientModule {
  /**
   * Module ID
   */
  id: string;

  /**
   * Module info
   */
  info: ModuleInfo;

  /**
   * Module public API
   */
  api: Record<string, any>;
}

/**
 * Client-side module manager
 */
export class ModuleManager {
  private client: AppletHubClient;
  private modules: Map<string, ClientModule> = new Map();
  private loadedScripts: Set<string> = new Set();

  /**
   * Create a new module manager
   */
  constructor(client: AppletHubClient) {
    this.client = client;
  }

  /**
   * List available modules
   */
  async listModules(): Promise<ModuleInfo[]> {
    return this.client.call("system.modules.list");
  }

  /**
   * Find modules by capability
   */
  async findModulesByCapability(capability: string): Promise<ModuleInfo[]> {
    return this.client.call("system.modules.findByCapability", { capability });
  }

  /**
   * Find modules by slot
   */
  async findModulesBySlot(slot: string): Promise<ModuleInfo[]> {
    return this.client.call("system.modules.findBySlot", { slot });
  }

  /**
   * Get module info
   */
  async getModuleInfo(moduleId: string): Promise<ModuleInfo> {
    return this.client.call("system.modules.getInfo", { moduleId });
  }

  /**
   * Load modules
   */
  async loadModules(moduleIds: string[]): Promise<ClientModule[]> {
    if (moduleIds.length === 0) {
      return [];
    }

    // Get load order from server
    const loadOrder = await this.client.call<string[]>(
      "system.modules.resolveLoadOrder",
      { moduleIds }
    );

    const result: ClientModule[] = [];

    // Load each module in order
    for (const moduleId of loadOrder) {
      // Skip if already loaded
      if (this.modules.has(moduleId)) {
        result.push(this.modules.get(moduleId)!);
        continue;
      }

      // Get module info
      const info = await this.getModuleInfo(moduleId);

      // Load module script
      await this.loadModuleScript(moduleId);

      // Create module instance
      const clientModule: ClientModule = {
        id: moduleId,
        info,
        api: this.getModuleApi(moduleId) || {},
      };

      // Add to loaded modules
      this.modules.set(moduleId, clientModule);
      result.push(clientModule);
    }

    return result;
  }

  /**
   * Get a loaded module
   */
  getModule(moduleId: string): ClientModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all loaded modules
   */
  getAllModules(): ClientModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Load a module script
   */
  private async loadModuleScript(moduleId: string): Promise<void> {
    // Skip if already loaded
    if (this.loadedScripts.has(moduleId)) {
      return;
    }

    // Construct script URL
    const scriptUrl = `${this.client.getBaseUrl()}/module/${moduleId}/client.js`;

    // Load the script
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;

      script.onload = () => {
        this.loadedScripts.add(moduleId);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load module script: ${moduleId}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Get module API
   */
  private getModuleApi(moduleId: string): Record<string, any> | undefined {
    // Check if module registered itself in the global scope
    const globalApiKey = `__appletHub_module_${moduleId}`;

    // @ts-ignore - Access global scope
    if (window[globalApiKey]) {
      // @ts-ignore - Access global scope
      return window[globalApiKey];
    }

    // Try to find module in global registry
    // @ts-ignore - Access global scope
    const globalRegistry = window.__appletHub_modules;
    if (globalRegistry && globalRegistry[moduleId]) {
      return globalRegistry[moduleId];
    }

    return undefined;
  }
}

/**
 * Create a module manager
 */
export function createModuleManager(client: AppletHubClient): ModuleManager {
  return new ModuleManager(client);
}

// Default export
export default createModuleManager;
