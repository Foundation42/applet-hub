// ModuleSystemFactory.ts - Factory for creating a complete module system

import {
  ModuleManager,
  ModuleLoader,
  ModuleRepository,
  ServiceRegistry,
} from "./ModuleSystem";
import { DefaultModuleManager } from "./ModuleManager";
import { FileSystemModuleLoader, InMemoryModuleLoader } from "./ModuleLoader";
import {
  FileSystemModuleRepository,
  InMemoryModuleRepository,
} from "./ModuleRepository";
import { DefaultServiceRegistry } from "./ServiceRegistry";
import { TupleStore } from "../tuple-store/TupleStore";
import { ObservableTupleStore } from "../tuple-store/ObservableTupleStore";
import { JournaledTupleStore } from "../tuple-store/JournaledTupleStore";
import { CoreTupleStore } from "../tuple-store/CoreTupleStore";
import path from "path";

/**
 * Configuration options for the module system
 */
export interface ModuleSystemOptions {
  /**
   * Type of module system to create
   * 'file-system' - Loads modules from the file system
   * 'in-memory' - In-memory module system for testing
   */
  type?: "file-system" | "in-memory";

  /**
   * Base directory for modules (required for file-system type)
   */
  modulesDir?: string;

  /**
   * Global state store (if not provided, a new one will be created)
   */
  systemStore?: TupleStore;

  /**
   * Service registry (if not provided, a new one will be created)
   */
  serviceRegistry?: ServiceRegistry;

  /**
   * Enable journaling for the system store
   */
  enableJournaling?: boolean;

  /**
   * Module repository (if not provided, a new one will be created)
   */
  repository?: ModuleRepository;

  /**
   * Module loader (if not provided, a new one will be created)
   */
  loader?: ModuleLoader;
}

/**
 * Module system components
 */
export interface ModuleSystem {
  /**
   * Module manager
   */
  manager: ModuleManager;

  /**
   * Module loader
   */
  loader: ModuleLoader;

  /**
   * Module repository
   */
  repository: ModuleRepository;

  /**
   * Service registry
   */
  serviceRegistry: ServiceRegistry;

  /**
   * System state store
   */
  systemStore: TupleStore;
}

/**
 * Create a complete module system
 */
export function createModuleSystem(
  options: ModuleSystemOptions = {}
): ModuleSystem {
  const type = options.type || "file-system";

  // Create the system store if not provided
  const systemStore =
    options.systemStore || createSystemStore(options.enableJournaling);

  // Create the service registry if not provided
  const serviceRegistry =
    options.serviceRegistry || new DefaultServiceRegistry();

  // Create repository and loader based on type
  let repository: ModuleRepository;
  let loader: ModuleLoader;

  if (type === "file-system") {
    const modulesDir =
      options.modulesDir || path.join(process.cwd(), "modules");

    repository =
      options.repository ||
      new FileSystemModuleRepository({
        modulesDir,
      });

    loader =
      options.loader ||
      new FileSystemModuleLoader({
        modulesDir,
        repository,
      });
  } else {
    repository = options.repository || new InMemoryModuleRepository();
    loader = options.loader || new InMemoryModuleLoader();
  }

  // Create the module manager
  const manager = new DefaultModuleManager({
    repository,
    loader,
    systemStore,
    serviceRegistry,
  });

  return {
    manager,
    loader,
    repository,
    serviceRegistry,
    systemStore,
  };
}

/**
 * Create a system state store
 */
function createSystemStore(enableJournaling = true): TupleStore {
  const core = new CoreTupleStore();

  // Add journaling if requested
  const withJournal = enableJournaling
    ? new JournaledTupleStore({ store: core })
    : core;

  // Always add observability
  return new ObservableTupleStore({ store: withJournal });
}

/**
 * Default export is a function that creates a complete module system
 */
export default createModuleSystem;
