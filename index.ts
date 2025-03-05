// Main entry point for the AppletHub application
import { createModuleSystem } from './src/module-system/ModuleSystemFactory';
import { TupleStoreFactory } from './src/tuple-store/factory';

// Parse command line arguments
const args = process.argv.slice(2);
const testMode = args.includes('--test') || args.includes('-t');

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
    try {
      console.log("📊 Looking for admin dashboard module...");
      // If admin dashboard exists, register it
      const adminDashboard = await import('./src/admin-dashboard/index');
      const adminModule = adminDashboard.createModule();
      moduleSystem.manager.registerModule(adminModule);
      loadedModules.push(adminModule);
      console.log("✅ Admin dashboard module registered");
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
    
    // Start all registered modules
    console.log("🚀 Starting all modules...");
    for (const module of loadedModules) {
      console.log(`Starting module: ${module.getManifest().id}...`);
      try {
        await module.initialize({
          store: moduleSystem.systemStore,
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
    
    // If not in test mode, keep the process alive
    if (!testMode) {
      console.log("💡 Press Ctrl+C to stop the server");
      
      // Set up graceful shutdown
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
      
      // Keep the process alive
      await new Promise(() => {});
    } else {
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