// example.ts - Example usage of the module system

import { createModuleSystem } from "./ModuleSystemFactory";
import { ModuleManifest } from "./ModuleSystem";
import { createSimpleModule } from "./ModuleLoader";
import { InMemoryModuleLoader, InMemoryModuleRepository } from "./ModuleLoader";
import path from "path";

// Example 1: Creating a file-system based module system
async function createFileSystemModuleSystem() {
  console.log("Example 1: File System Module System");

  // Create the module system
  const moduleSystem = createModuleSystem({
    type: "file-system",
    modulesDir: path.join(process.cwd(), "modules"),
    enableJournaling: true,
  });

  // Refresh the repository to find modules
  await moduleSystem.repository.refresh();

  // List available modules
  const modules = moduleSystem.repository.listModules();
  console.log(`Found ${modules.length} modules:`);
  modules.forEach((m) => console.log(`- ${m.name} (${m.id}) v${m.version}`));

  // Load and initialize a module
  if (modules.length > 0) {
    const moduleId = modules[0].id;
    console.log(`Loading module ${moduleId}...`);

    const loadedModules = await moduleSystem.manager.loadModules([moduleId]);

    if (loadedModules.length > 0) {
      console.log(`Successfully loaded ${loadedModules.length} modules`);

      // Access the module API
      const api = loadedModules[0].getAPI();
      console.log(`Module API:`, Object.keys(api));
    } else {
      console.log(`Failed to load module ${moduleId}`);
    }
  }
}

// Example 2: Creating an in-memory module system with test modules
async function createInMemoryModuleSystem() {
  console.log("\nExample 2: In-Memory Module System");

  // Create the module system
  const moduleSystem = createModuleSystem({
    type: "in-memory",
  });

  // Create test modules

  // Module A
  const manifestA: ModuleManifest = {
    id: "moduleA",
    name: "Module A",
    description: "A test module that provides core functionality",
    version: "1.0.0",
    entryPoint: "index.js",
    capabilities: ["core-functionality"],
    slots: ["main-panel"],
  };

  const moduleA = createSimpleModule(manifestA, {
    initialize: async (context) => {
      console.log("Initializing Module A");

      // Store some state
      await context.store.set("message", "Hello from Module A");

      // Register a service
      context.services.registerService({
        id: "coreService",
        implementation: {
          sayHello: () => "Hello from Core Service!",
          getValue: () => 42,
        },
        version: "1.0.0",
        metadata: {
          description: "Core service provided by Module A",
        },
      });

      return true;
    },
    getAPI: () => ({
      getMessage: () => "Hello from Module A API",
    }),
  });

  // Module B (depends on Module A)
  const manifestB: ModuleManifest = {
    id: "moduleB",
    name: "Module B",
    description: "A test module that depends on Module A",
    version: "1.0.0",
    entryPoint: "index.js",
    capabilities: ["additional-functionality"],
    dependencies: {
      moduleA: "^1.0.0",
    },
  };

  const moduleB = createSimpleModule(manifestB, {
    initialize: async (context) => {
      console.log("Initializing Module B");

      // Get module A
      const moduleA = context.getModule("moduleA");
      if (!moduleA) {
        console.error("Module A not found");
        return false;
      }

      // Use module A's API
      const moduleAAPI = moduleA.getAPI();
      console.log(`Message from Module A: ${moduleAAPI.getMessage()}`);

      // Use the service registered by Module A
      const coreService = context.services.getService("coreService");
      if (coreService) {
        console.log(`Core service message: ${coreService.sayHello()}`);
        console.log(`Core service value: ${coreService.getValue()}`);
      }

      return true;
    },
  });

  // Register modules with the in-memory loader and repository
  const loader = moduleSystem.loader as InMemoryModuleLoader;
  const repository = moduleSystem.repository as InMemoryModuleRepository;

  loader.registerModule(moduleA);
  loader.registerModule(moduleB);
  repository.addModule(manifestA);
  repository.addModule(manifestB);

  // Check dependency resolution
  console.log(
    "Module load order:",
    moduleSystem.manager.resolveLoadOrder(["moduleB"])
  );

  // Load modules (this will respect dependencies)
  console.log("Loading modules...");
  const loadedModules = await moduleSystem.manager.loadModules(["moduleB"]);

  console.log(`Successfully loaded ${loadedModules.length} modules`);

  // Subscribe to state changes
  moduleSystem.systemStore.subscribe("**", (newValue, oldValue, path) => {
    console.log(`State change at ${path.join(".")}:`, oldValue, "->", newValue);
  });

  // Stop the modules
  console.log("Stopping modules...");
  await moduleSystem.manager.stopModule("moduleB");
  await moduleSystem.manager.stopModule("moduleA");
}

// Run examples
async function runExamples() {
  // Uncomment to run file system example
  // await createFileSystemModuleSystem();

  // Run in-memory example
  await createInMemoryModuleSystem();
}

// Run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { createFileSystemModuleSystem, createInMemoryModuleSystem };
