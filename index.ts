// Main entry point for the AppletHub application
import { createModuleSystem } from './src/module-system/ModuleSystemFactory';
import { TupleStoreFactory } from './src/tuple-store/factory';

// Parse command line arguments
const args = process.argv.slice(2);
const testMode = args.includes('--test') || args.includes('-t');
const detachedMode = args.includes('--detached') || args.includes('-d');

async function main() {
  console.log("=== Starting AppletHub ===");
  
  // Initialize core systems
  console.log("🔄 Initializing core systems...");
  const moduleSystem = createModuleSystem();
  const tupleStore = TupleStoreFactory.createObservable();
  
  // Register required modules
  console.log("🧩 Registering modules...");
  try {
    await moduleSystem.repository.refresh();
    
    // Create a list to track our modules
    const loadedModules = [];
    
    // Register the HTTP server module
    console.log("📡 Registering HTTP server module...");
    const httpModule = await import('./src/http-server/index');
    const httpModuleInstance = httpModule.createModule();
    moduleSystem.manager.registerModule(httpModuleInstance);
    loadedModules.push(httpModuleInstance);
    
    // Register other modules if available
    // First load UI components module which other modules depend on
    try {
      console.log("🎨 Looking for UI components module...");
      const uiComponents = await import('./src/ui-components/index');
      const uiComponentsModule = uiComponents.createModule();
      
      // Register the module
      const registration = moduleSystem.manager.registerModule(uiComponentsModule);
      if (registration) {
        loadedModules.push(uiComponentsModule);
        console.log("✅ UI components module registered successfully");
      } else {
        console.error("❌ Failed to register UI components module");
      }
    } catch (error) {
      console.error("Error loading UI components module:", error);
      console.warn("UI components module not found. Continuing without it.");
    }
    
    try {
      console.log("📊 Looking for admin dashboard module...");
      // If admin dashboard exists, register it
      try {
        const adminDashboard = await import('./src/admin-dashboard/index');
        const adminModule = adminDashboard.createModule();
        moduleSystem.manager.registerModule(adminModule);
        loadedModules.push(adminModule);
        console.log("✅ Admin dashboard module registered");
      } catch (importError) {
        console.error("Error importing admin dashboard:", importError);
        throw importError;
      }
    } catch (error) {
      console.warn("Admin dashboard module not found. Continuing without it.");
    }
    
    try {
      console.log("🗄️ Looking for static files module...");
      const staticFiles = await import('./src/static-files/index');
      const staticFilesModule = staticFiles.createModule();
      moduleSystem.manager.registerModule(staticFilesModule);
      loadedModules.push(staticFilesModule);
      console.log("✅ Static files module registered");
    } catch (error) {
      console.warn("Static files module not found. Continuing without it.");
    }
    
    // Load UI test app module if available
    try {
      console.log("🧪 Looking for UI test app module...");
      const uiTestApp = await import('./src/ui-test-app/index');
      const uiTestAppModule = {
        initialize: uiTestApp.initialize,
        stop: uiTestApp.cleanup,
        getState: () => 'active',
        getManifest: () => ({
          id: 'ui-test-app',
          name: 'UI Test App',
          description: 'UI components test application',
          version: '0.1.0',
          entryPoint: 'index.ts',
          capabilities: ['ui-components'],
          slots: ['main', 'sidebar'],
          dependencies: {
            'ui-components': '^1.0.0'
          }
        })
      };
      moduleSystem.manager.registerModule(uiTestAppModule);
      loadedModules.push(uiTestAppModule);
      console.log("✅ UI test app module registered");
    } catch (error) {
      console.error("Error loading UI test app module:", error);
      console.warn("UI test app module not found. Continuing without it.");
    }
    
    // Start all registered modules
    console.log("🚀 Starting all modules...");
    for (const module of loadedModules) {
      console.log(`Starting module: ${module.getManifest().id}...`);
      try {
        await module.initialize({
          manifest: module.getManifest(),
          store: moduleSystem.systemStore,
          system: moduleSystem.systemStore,
          services: moduleSystem.serviceRegistry,
          getModule: (id) => {
            const mod = loadedModules.find(m => m.getManifest().id === id);
            return mod || null;
          }
        });
        console.log(`Module ${module.getManifest().id} started successfully`);
      } catch (error) {
        console.error(`Failed to start module ${module.getManifest().id}:`, error);
      }
    }
    
    console.log("✅ AppletHub is running!");
    console.log("📊 Admin dashboard available at: http://localhost:3000/admin");
    
    // Set up graceful shutdown
    const setupShutdown = () => {
      process.on('SIGINT', async () => {
        console.log("\n🛑 Shutting down AppletHub...");
        
        // Stop all modules
        for (const module of loadedModules) {
          try {
            console.log(`Stopping module: ${module.getManifest().id}...`);
            await module.stop();
            console.log(`Module ${module.getManifest().id} stopped successfully`);
          } catch (err) {
            console.error(`Error stopping module ${module.getManifest().id}:`, err);
          }
        }
        
        console.log("👋 Goodbye!");
        process.exit(0);
      });
    };
    
    // Determine how to proceed based on mode
    if (testMode) {
      console.log("🧪 Running in test mode, shutting down automatically");
      
      // Stop all modules
      console.log("🛑 Stopping all modules...");
      for (const module of loadedModules) {
        try {
          await module.stop();
        } catch (err) {
          console.error(`Error stopping module ${module.getManifest().id}:`, err);
        }
      }
    } else if (detachedMode) {
      console.log("🔄 Running in detached mode");
      setupShutdown();
      
      // Start a timer that runs every minute to keep the process alive
      // This allows us to return control to the CLI without closing the server
      const timer = setInterval(() => {
        const now = new Date();
        if (now.getSeconds() === 0) {
          console.log(`AppletHub running (${now.toLocaleTimeString()})`);
        }
      }, 1000);
      
      // Allow the main function to return, keeping the process alive
      return moduleSystem;
    } else {
      console.log("💡 Press Ctrl+C to stop the server");
      setupShutdown();
      
      // Keep the process alive
      await new Promise(() => {});
    }
    
    return moduleSystem;
  } catch (error) {
    console.error("❌ Error during module registration:", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});