// admin-dashboard/index.ts
import { ModuleContext } from '../../module-system.ts/ModuleSystem';
import { registerComponents } from './components';
import { DashboardService } from './services/DashboardService';

// Store the dashboard service instance
let dashboardService: DashboardService | null = null;

/**
 * Initialize the Admin Dashboard module
 */
export async function initialize(context: ModuleContext): Promise<boolean> {
  console.log('Initializing Admin Dashboard module');
  
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
    component: 'admin-dashboard-main-view',
    priority: 10,
  });
  
  context.ui.registerView({
    slot: 'sidebar',
    component: 'admin-dashboard-sidebar',
    priority: 5,
  });
  
  // Create and register dashboard service
  dashboardService = new DashboardService(context);
  
  context.services.registerService({
    id: 'dashboardService',
    implementation: dashboardService,
    version: '1.0.0',
    metadata: {
      description: 'Administrative dashboard service for AppletHub',
    },
  });
  
  return true;
}

/**
 * Clean up when the module is stopped
 */
export async function cleanup(context: ModuleContext): Promise<boolean> {
  console.log('Cleaning up Admin Dashboard module');
  
  // Unregister UI views
  context.ui.unregisterView('main', 'admin-dashboard-main-view');
  context.ui.unregisterView('sidebar', 'admin-dashboard-sidebar');
  
  // Clear service instance
  dashboardService = null;
  
  return true;
}

/**
 * Public API exposed by this module
 */
export function getAPI() {
  return {
    // Public methods and properties
    getName: () => 'Admin Dashboard',
    getVersion: () => '0.1.0',
    getDashboardService: () => dashboardService,
  };
}