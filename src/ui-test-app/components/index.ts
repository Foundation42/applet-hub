// ui-test-app/components/index.ts
import { UIComponentService } from '@ui-components/services/UIComponentService';
import { mainViewComponent } from './main-view';
import { sidebarComponent } from './sidebar';

/**
 * Register all components with the UI service
 */
export async function registerComponents(service: UIComponentService): Promise<void> {
  // Register main components
  service.registerComponent(mainViewComponent);
  service.registerComponent(sidebarComponent);
  
  console.log('Registered Ui Test App components');
}