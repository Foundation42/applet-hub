// ModuleManager.ts - Implementation of the module manager

import {
  Module,
  ModuleLoader,
  ModuleManager,
  ModuleRepository,
  ModuleState,
} from "./ModuleSystem";
import { TupleStore } from "../tuple-store/TupleStore";
import { ServiceRegistry } from "./ModuleSystem";
import { DefaultServiceRegistry } from "./ServiceRegistry";

/**
 * Options for the default module manager
 */
export interface DefaultModuleManagerOptions {
  /**
   * Module repository
   */
  repository: ModuleRepository;

  /**
   * Module loader
   */
  loader: ModuleLoader;

  /**
   * Global state store
   */
  systemStore: TupleStore;

  /**
   * Service registry
   */
  serviceRegistry?: ServiceRegistry;
}

/**
 * Default implementation of the module manager
 */
export class DefaultModuleManager implements ModuleManager {
  private repository: ModuleRepository;
  private loader: ModuleLoader;
  private modules: Map<string, Module>;
  private systemStore: TupleStore;
  private moduleStores: Map<string, TupleStore>;
  private serviceRegistry: ServiceRegistry;
  private dependencyGraph: Map<
    string,
    { dependencies: Set<string>; dependents: Set<string> }
  >;

  /**
   * Create a new module manager
   */
  constructor(options: DefaultModuleManagerOptions) {
    this.repository = options.repository;
    this.loader = options.loader;
    this.systemStore = options.systemStore;
    this.serviceRegistry =
      options.serviceRegistry || new DefaultServiceRegistry();
    this.modules = new Map();
    this.moduleStores = new Map();
    this.dependencyGraph = new Map();
  }

  /**
   * Register a module
   */
  registerModule(module: Module): boolean {
    // Check if module is already registered
    if (this.modules.has(module.getManifest().id)) {
      return false;
    }

    // Add to modules map
    this.modules.set(module.getManifest().id, module);

    // Create dependency graph entry
    this.updateDependencyGraph(module);

    return true;
  }

  /**
   * Update the dependency graph for a module
   */
  private updateDependencyGraph(module: Module): void {
    const moduleId = module.getManifest().id;
    const dependencies = module.getManifest().dependencies || {};

    // Create graph entry if it doesn't exist
    if (!this.dependencyGraph.has(moduleId)) {
      this.dependencyGraph.set(moduleId, {
        dependencies: new Set(),
        dependents: new Set(),
      });
    }

    const graphNode = this.dependencyGraph.get(moduleId)!;

    // Add dependencies
    for (const depId of Object.keys(dependencies)) {
      graphNode.dependencies.add(depId);

      // Add reverse dependency
      if (!this.dependencyGraph.has(depId)) {
        this.dependencyGraph.set(depId, {
          dependencies: new Set(),
          dependents: new Set(),
        });
      }

      this.dependencyGraph.get(depId)!.dependents.add(moduleId);
    }
  }

  /**
   * Initialize a module
   */
  async initializeModule(moduleId: string): Promise<boolean> {
    // Check if module exists
    const module = this.modules.get(moduleId);
    if (!module) {
      console.error(`Module ${moduleId} not found`);
      return false;
    }

    // Check if module is already active
    if (module.getState() === ModuleState.ACTIVE) {
      return true;
    }

    // Create module store if it doesn't exist
    if (!this.moduleStores.has(moduleId)) {
      // TODO: Create a proper module-specific store with namespace
      this.moduleStores.set(moduleId, this.systemStore);
    }

    // Initialize the module
    try {
      const manifest = module.getManifest();

      const result = await module.initialize({
        manifest,
        store: this.moduleStores.get(moduleId)!,
        system: this.systemStore,
        services: this.serviceRegistry,
        getModule: (id) => this.modules.get(id),
      });

      return result;
    } catch (error) {
      console.error(`Error initializing module ${moduleId}:`, error);
      return false;
    }
  }

  /**
   * Stop a module
   */
  async stopModule(moduleId: string): Promise<boolean> {
    // Check if module exists
    const module = this.modules.get(moduleId);
    if (!module) {
      console.error(`Module ${moduleId} not found`);
      return false;
    }

    // Check if module is active
    if (module.getState() !== ModuleState.ACTIVE) {
      return true;
    }

    // Stop the module
    try {
      return await module.stop();
    } catch (error) {
      console.error(`Error stopping module ${moduleId}:`, error);
      return false;
    }
  }

  /**
   * Get a module by ID
   */
  getModule(moduleId: string): Module | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): Record<string, Module> {
    const result: Record<string, Module> = {};

    for (const [id, module] of this.modules.entries()) {
      result[id] = module;
    }

    return result;
  }

  /**
   * Load modules based on dependencies
   */
  async loadModules(moduleIds: string[]): Promise<Module[]> {
    // Resolve load order
    const loadOrder = this.resolveLoadOrder(moduleIds);
    const result: Module[] = [];

    // Load and initialize each module in order
    for (const moduleId of loadOrder) {
      // Skip if already loaded
      if (this.modules.has(moduleId)) {
        const module = this.modules.get(moduleId)!;

        // Initialize if not already active
        if (module.getState() !== ModuleState.ACTIVE) {
          await this.initializeModule(moduleId);
        }

        result.push(module);
        continue;
      }

      // Load the module
      try {
        const module = await this.loader.loadModule(moduleId);

        if (module) {
          // Register the module
          this.registerModule(module);

          // Initialize the module
          await this.initializeModule(moduleId);

          result.push(module);
        } else {
          console.error(`Failed to load module ${moduleId}`);
        }
      } catch (error) {
        console.error(`Error loading module ${moduleId}:`, error);
      }
    }

    return result;
  }

  /**
   * Resolve load order based on dependencies
   */
  resolveLoadOrder(moduleIds: string[]): string[] {
    // First, collect all required modules including dependencies
    const requiredModules = new Set(moduleIds);

    // Add all dependencies recursively
    const addDependencies = (id: string) => {
      const manifest = this.repository.getModuleManifest(id);
      if (!manifest) return;

      const dependencies = manifest.dependencies || {};

      for (const depId of Object.keys(dependencies)) {
        if (!requiredModules.has(depId)) {
          requiredModules.add(depId);
          addDependencies(depId);
        }
      }
    };

    // Collect all dependencies
    for (const id of moduleIds) {
      addDependencies(id);
    }

    // Topological sort
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];

    // DFS-based topological sort
    const visit = (id: string) => {
      // Skip if already processed
      if (visited.has(id)) return;

      // Detect cycles
      if (temp.has(id)) {
        console.warn(`Circular dependency detected involving module ${id}`);
        return;
      }

      temp.add(id);

      // Visit dependencies first
      const manifest = this.repository.getModuleManifest(id);
      if (manifest && manifest.dependencies) {
        for (const depId of Object.keys(manifest.dependencies)) {
          visit(depId);
        }
      }

      temp.delete(id);
      visited.add(id);
      result.push(id);
    };

    // Process all required modules
    for (const id of requiredModules) {
      visit(id);
    }

    return result;
  }

  /**
   * Get module dependencies
   */
  getModuleDependencies(moduleId: string, recursive = false): string[] {
    const node = this.dependencyGraph.get(moduleId);
    if (!node) return [];

    if (!recursive) {
      return Array.from(node.dependencies);
    }

    // Get recursive dependencies (DFS)
    const result = new Set<string>();
    const visited = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = this.dependencyGraph.get(id);
      if (!node) return;

      for (const depId of node.dependencies) {
        result.add(depId);
        visit(depId);
      }
    };

    visit(moduleId);
    return Array.from(result);
  }

  /**
   * Get module dependents
   */
  getModuleDependents(moduleId: string, recursive = false): string[] {
    const node = this.dependencyGraph.get(moduleId);
    if (!node) return [];

    if (!recursive) {
      return Array.from(node.dependents);
    }

    // Get recursive dependents (DFS)
    const result = new Set<string>();
    const visited = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = this.dependencyGraph.get(id);
      if (!node) return;

      for (const depId of node.dependents) {
        result.add(depId);
        visit(depId);
      }
    };

    visit(moduleId);
    return Array.from(result);
  }

  /**
   * Refresh the module manager
   */
  async refresh(): Promise<void> {
    // Refresh the repository
    await this.repository.refresh();

    // Update dependency graph for existing modules
    for (const module of this.modules.values()) {
      this.updateDependencyGraph(module);
    }
  }
}
