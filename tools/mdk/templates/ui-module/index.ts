// {{moduleId}}/index.ts
import { ModuleContext } from '../../module-system.ts/ModuleSystem';
import { registerComponents } from './components';

/**
 * Initialize the {{moduleName}} module
 */
export async function initialize(context: ModuleContext): Promise<boolean> {
  console.log('Initializing {{moduleName}} module');
  
  // Get UI component service
  const uiComponentService = context.services.getService('uiComponentService');
  if (!uiComponentService) {
    console.error('UI Component service not available');
    return false;
  }
  
  // Register components with UI service
  await registerComponents(uiComponentService);
  
  // Register UI views for available slots
  context.ui.registerView({
    slot: 'main',
    component: '{{moduleId}}-main-view',
    priority: 10,
  });
  
  context.ui.registerView({
    slot: 'sidebar',
    component: '{{moduleId}}-sidebar',
    priority: 5,
  });
  
  return true;
}

/**
 * Clean up when the module is stopped
 */
export async function cleanup(context: ModuleContext): Promise<boolean> {
  console.log('Cleaning up {{moduleName}} module');
  
  // Unregister UI views
  context.ui.unregisterView('main', '{{moduleId}}-main-view');
  context.ui.unregisterView('sidebar', '{{moduleId}}-sidebar');
  
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