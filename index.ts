// Main entry point to try the AppletHub system
import { createInMemoryModuleSystem } from "./src/module-system.ts/example";
import { runAllExamples as runTupleStoreExamples } from "./src/tuple-store/example";

async function main() {
  console.log("=== AppletHub Demo ===");
  
  // Run tuple store examples
  console.log("\n🔄 Running TupleStore Examples:");
  runTupleStoreExamples();
  
  // Run module system examples
  console.log("\n🧩 Running ModuleSystem Examples:");
  await createInMemoryModuleSystem();
}

main().catch(console.error);