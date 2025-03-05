// admin-dashboard/components/index.ts
import { UIComponentService } from '../../../ui-components/services/UIComponentService';
import { mainViewComponent } from './main-view';
import { sidebarComponent } from './sidebar';
import { systemInfoPanelComponent } from './panels/system-info-panel';
import { moduleManagerPanelComponent } from './panels/module-manager-panel';
import { tupleStoreExplorerPanelComponent } from './panels/tuplestore-explorer-panel';

/**
 * Register all components with the UI service
 */
export async function registerComponents(service: UIComponentService): Promise<void> {
  // Register main components
  service.registerComponent(mainViewComponent);
  service.registerComponent(sidebarComponent);
  
  // Register panel components
  service.registerComponent(systemInfoPanelComponent);
  service.registerComponent(moduleManagerPanelComponent);
  service.registerComponent(tupleStoreExplorerPanelComponent);
  
  console.log('Registered Admin Dashboard components');
}