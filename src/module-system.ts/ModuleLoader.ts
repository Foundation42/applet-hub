// ModuleLoader.ts - Implementation of the module loader

import {
  Module,
  ModuleLoader,
  ModuleManifest,
  ModuleRepository,
  ModuleState,
} from "./ModuleSystem";
import path from "path";
import fs from "fs";

/**
 * Options for the file system module loader
 */
interface FileSystemModuleLoaderOptions {
  /**
   * Base directory for modules
   */
  modulesDir: string;

  /**
   * Module repository
   */
  repository: ModuleRepository;
}

/**
 * Abstract base module implementation
 */
export abstract class BaseModule implements Module {
  protected manifest: ModuleManifest;
  protected state: ModuleState;

  constructor(manifest: ModuleManifest) {
    this.manifest = manifest;
    this.state = ModuleState.REGISTERED;
  }

  abstract initialize(context: any): Promise<boolean>;
  abstract stop(): Promise<boolean>;

  getState(): ModuleState {
    return this.state;
  }

  getManifest(): ModuleManifest {
    return this.manifest;
  }

  getAPI(): Record<string, any> {
    return {};
  }
}

/**
 * Implementation of a module loader that loads modules from the file system
 */
export class FileSystemModuleLoader implements ModuleLoader {
  private modulesDir: string;
  private repository: ModuleRepository;

  /**
   * Create a new file system module loader
   */
  constructor(options: FileSystemModuleLoaderOptions) {
    this.modulesDir = options.modulesDir;
    this.repository = options.repository;
  }

  /**
   * Load a module by ID
   */
  async loadModule(moduleId: string): Promise<Module | undefined> {
    // Get the module manifest
    const manifest = this.repository.getModuleManifest(moduleId);
    if (!manifest) {
      console.error(`Module ${moduleId} not found in repository`);
      return undefined;
    }

    try {
      // Determine the module path
      const modulePath = path.join(this.modulesDir, moduleId);
      const entryPointPath = path.join(modulePath, manifest.entryPoint);

      // Check if entry point exists
      if (!fs.existsSync(entryPointPath)) {
        console.error(
          `Entry point ${manifest.entryPoint} not found for module ${moduleId}`
        );
        return undefined;
      }

      // Load the module
      const moduleExports = await import(entryPointPath);

      // The module should export a createModule function
      if (typeof moduleExports.createModule !== "function") {
        console.error(
          `Module ${moduleId} does not export a createModule function`
        );
        return undefined;
      }

      // Create the module instance
      const module = moduleExports.createModule(manifest) as Module;

      // Validate the module
      if (!this.validateModule(module)) {
        console.error(`Module ${moduleId} is not a valid module`);
        return undefined;
      }

      return module;
    } catch (error) {
      console.error(`Error loading module ${moduleId}:`, error);
      return undefined;
    }
  }

  /**
   * Check if a module is available
   */
  hasModule(moduleId: string): boolean {
    return this.repository.getModuleManifest(moduleId) !== undefined;
  }

  /**
   * Get module manifest
   */
  getModuleManifest(moduleId: string): ModuleManifest | undefined {
    return this.repository.getModuleManifest(moduleId);
  }

  /**
   * Validate a module
   */
  private validateModule(module: any): module is Module {
    // Check if it implements the Module interface
    return (
      typeof module.initialize === "function" &&
      typeof module.stop === "function" &&
      typeof module.getState === "function" &&
      typeof module.getManifest === "function" &&
      typeof module.getAPI === "function"
    );
  }
}

/**
 * In-memory module loader for testing
 */
export class InMemoryModuleLoader implements ModuleLoader {
  private modules: Map<string, Module>;

  /**
   * Create a new in-memory module loader
   */
  constructor() {
    this.modules = new Map();
  }

  /**
   * Register a module
   */
  registerModule(module: Module): boolean {
    const moduleId = module.getManifest().id;

    // Check if already registered
    if (this.modules.has(moduleId)) {
      return false;
    }

    this.modules.set(moduleId, module);
    return true;
  }

  /**
   * Unregister a module
   */
  unregisterModule(moduleId: string): boolean {
    return this.modules.delete(moduleId);
  }

  /**
   * Load a module by ID
   */
  async loadModule(moduleId: string): Promise<Module | undefined> {
    return this.modules.get(moduleId);
  }

  /**
   * Check if a module is available
   */
  hasModule(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  /**
   * Get module manifest
   */
  getModuleManifest(moduleId: string): ModuleManifest | undefined {
    const module = this.modules.get(moduleId);
    return module?.getManifest();
  }
}

/**
 * A module factory for creating a simple module
 */
export function createSimpleModule(
  manifest: ModuleManifest,
  implementationFunctions: {
    initialize?: (context: any) => Promise<boolean>;
    stop?: () => Promise<boolean>;
    getAPI?: () => Record<string, any>;
  }
): Module {
  return new (class SimpleModule extends BaseModule {
    constructor(manifest: ModuleManifest) {
      super(manifest);
    }

    async initialize(context: any): Promise<boolean> {
      try {
        this.state = ModuleState.LOADING;

        // Call custom initialize if provided
        if (implementationFunctions.initialize) {
          const result = await implementationFunctions.initialize(context);
          if (!result) {
            this.state = ModuleState.ERROR;
            return false;
          }
        }

        this.state = ModuleState.ACTIVE;
        return true;
      } catch (error) {
        console.error(`Error initializing module ${this.manifest.id}:`, error);
        this.state = ModuleState.ERROR;
        return false;
      }
    }

    async stop(): Promise<boolean> {
      try {
        // Call custom stop if provided
        if (implementationFunctions.stop) {
          const result = await implementationFunctions.stop();
          if (!result) {
            return false;
          }
        }

        this.state = ModuleState.STOPPED;
        return true;
      } catch (error) {
        console.error(`Error stopping module ${this.manifest.id}:`, error);
        this.state = ModuleState.ERROR;
        return false;
      }
    }

    getAPI(): Record<string, any> {
      // Call custom getAPI if provided
      if (implementationFunctions.getAPI) {
        return implementationFunctions.getAPI();
      }

      return {};
    }
  })(manifest);
}
