// Main entry point for the AppletHub application
import { createModuleSystem } from './src/module-system/ModuleSystemFactory';
import { TupleStoreFactory } from './src/tuple-store/factory';

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
    
    // Register the HTTP server module
    console.log("📡 Registering HTTP server module...");
    const httpModule = await import('./src/http-server/index');
    await moduleSystem.manager.registerModule(httpModule.createModule());
    
    // Register other modules if available
    try {
      console.log("📊 Looking for admin dashboard module...");
      // If admin dashboard exists, register it
      const adminDashboard = await import('./src/admin-dashboard/index');
      await moduleSystem.manager.registerModule(adminDashboard.createModule());
      console.log("✅ Admin dashboard module registered");
    } catch (error) {
      console.warn("Admin dashboard module not found. Continuing without it.");
    }
    
    try {
      console.log("🗄️ Looking for static files module...");
      const staticFiles = await import('./src/static-files/index');
      await moduleSystem.manager.registerModule(staticFiles.createModule());
      console.log("✅ Static files module registered");
    } catch (error) {
      console.warn("Static files module not found. Continuing without it.");
    }
    
    // Start all registered modules
    console.log("🚀 Starting all modules...");
    const modules = moduleSystem.repository.listModules();
    const moduleIds = modules.map(m => m.id);
    await moduleSystem.manager.loadModules(moduleIds);
    
    console.log("✅ AppletHub is running!");
    console.log("📊 Admin dashboard available at: http://localhost:3000/admin");
  } catch (error) {
    console.error("❌ Error during module registration:", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});