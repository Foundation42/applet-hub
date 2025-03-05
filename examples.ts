// Examples for testing and demonstrating AppletHub components
import { createInMemoryModuleSystem } from "./src/module-system/example";
import { runAllExamples as runTupleStoreExamples } from "./src/tuple-store/example";

async function main() {
  console.log("=== AppletHub Examples ===");
  
  // Run tuple store examples
  console.log("\n🔄 Running TupleStore Examples:");
  runTupleStoreExamples();
  
  // Run module system examples
  console.log("\n🧩 Running ModuleSystem Examples:");
  await createInMemoryModuleSystem();
}

main().catch(console.error);