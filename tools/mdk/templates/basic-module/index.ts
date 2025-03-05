// {{moduleId}}/index.ts
import { ModuleContext } from '../../module-system.ts/ModuleSystem';

/**
 * Initialize the {{moduleName}} module
 */
export async function initialize(context: ModuleContext): Promise<boolean> {
  console.log('Initializing {{moduleName}} module');
  
  // Access the module's store (scoped to this module)
  await context.store.set('initialized', true);
  
  // Register any services this module provides
  // context.services.registerService({
  //   id: '{{moduleId}}Service',
  //   implementation: {
  //     // Service methods
  //   },
  //   version: '0.1.0',
  // });
  
  return true;
}

/**
 * Clean up when the module is stopped
 */
export async function cleanup(context: ModuleContext): Promise<boolean> {
  console.log('Cleaning up {{moduleName}} module');
  return true;
}

/**
 * Public API exposed by this module
 */
export function getAPI() {
  return {
    // Public methods and properties
    getName: () => '{{moduleName}}',
    getVersion: () => '0.1.0',
  };
}