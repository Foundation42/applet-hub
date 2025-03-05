// ModuleSystem.ts - Core interfaces for the module system

import { TupleStore } from "../tuple-store/TupleStore";

/**
 * Module manifest that describes a module and its requirements
 */
export interface ModuleManifest {
  /**
   * Unique identifier for the module
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Module description
   */
  description?: string;

  /**
   * Semantic version string
   */
  version: string;

  /**
   * Author information
   */
  author?: string;

  /**
   * Main entry point file
   */
  entryPoint: string;

  /**
   * UI slots this module can render to
   */
  slots?: string[];

  /**
   * Capabilities provided by this module
   */
  capabilities?: string[];

  /**
   * Module dependencies as a map of module ID to version requirement
   */
  dependencies?: Record<string, string>;

  /**
   * Optional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Module instance state
 */
export enum ModuleState {
  /**
   * Module is registered but not loaded
   */
  REGISTERED = "registered",

  /**
   * Module is currently loading
   */
  LOADING = "loading",

  /**
   * Module is loaded but not initialized
   */
  LOADED = "loaded",

  /**
   * Module is initialized and active
   */
  ACTIVE = "active",

  /**
   * Module has been stopped
   */
  STOPPED = "stopped",

  /**
   * Module has encountered an error
   */
  ERROR = "error",
}

/**
 * Module initialization context
 */
export interface ModuleContext {
  /**
   * Module's manifest
   */
  manifest: ModuleManifest;

  /**
   * Module state store (namespace for this module only)
   */
  store: TupleStore;

  /**
   * Global system store
   */
  system: TupleStore;

  /**
   * Service registry for RPC
   */
  services: ServiceRegistry;

  /**
   * Get a reference to another module (if available)
   */
  getModule: (moduleId: string) => Module | undefined;
}

/**
 * Service definition for RPC
 */
export interface ServiceDefinition {
  /**
   * Unique service identifier
   */
  id: string;

  /**
   * Service implementation
   */
  implementation: Record<string, Function>;

  /**
   * Service version
   */
  version: string;

  /**
   * Optional namespace
   */
  namespace?: string;

  /**
   * Required capabilities to access this service
   */
  requiredCapabilities?: string[];

  /**
   * Optional service metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Service registry for inter-module communication
 */
export interface ServiceRegistry {
  /**
   * Register a service
   */
  registerService(definition: ServiceDefinition): boolean;

  /**
   * Get a service by ID and optional version
   */
  getService(
    id: string,
    version?: string
  ): Record<string, Function> | undefined;

  /**
   * Check if a service exists
   */
  hasService(id: string, version?: string): boolean;

  /**
   * List all available services
   */
  listServices(): ServiceDefinition[];

  /**
   * Unregister a service
   */
  unregisterService(id: string, version?: string): boolean;
}

/**
 * Module interface that all modules must implement
 */
export interface Module {
  /**
   * Initialize the module
   */
  initialize(context: ModuleContext): Promise<boolean>;

  /**
   * Stop the module
   */
  stop(): Promise<boolean>;

  /**
   * Get module state
   */
  getState(): ModuleState;

  /**
   * Get module manifest
   */
  getManifest(): ModuleManifest;

  /**
   * Get module public API (if any)
   */
  getAPI(): Record<string, any>;
}

/**
 * Module loader responsibility
 */
export interface ModuleLoader {
  /**
   * Load a module by ID
   */
  loadModule(moduleId: string): Promise<Module | undefined>;

  /**
   * Check if a module is available
   */
  hasModule(moduleId: string): boolean;

  /**
   * Get module manifest
   */
  getModuleManifest(moduleId: string): ModuleManifest | undefined;
}

/**
 * Module repository for storing and retrieving modules
 */
export interface ModuleRepository {
  /**
   * Get a list of all available modules
   */
  listModules(): ModuleManifest[];

  /**
   * Get a specific module manifest
   */
  getModuleManifest(moduleId: string): ModuleManifest | undefined;

  /**
   * Find modules by capability
   */
  findModulesByCapability(capability: string): ModuleManifest[];

  /**
   * Find modules by slot
   */
  findModulesBySlot(slot: string): ModuleManifest[];

  /**
   * Refresh the module repository
   */
  refresh(): Promise<void>;
}

/**
 * Module manager that handles module lifecycle
 */
export interface ModuleManager {
  /**
   * Register a module
   */
  registerModule(module: Module): boolean;

  /**
   * Initialize a module by ID
   */
  initializeModule(moduleId: string): Promise<boolean>;

  /**
   * Stop a module by ID
   */
  stopModule(moduleId: string): Promise<boolean>;

  /**
   * Get a module by ID
   */
  getModule(moduleId: string): Module | undefined;

  /**
   * Get all registered modules
   */
  getAllModules(): Record<string, Module>;

  /**
   * Load modules based on dependencies
   */
  loadModules(moduleIds: string[]): Promise<Module[]>;

  /**
   * Resolve load order based on dependencies
   */
  resolveLoadOrder(moduleIds: string[]): string[];
}
