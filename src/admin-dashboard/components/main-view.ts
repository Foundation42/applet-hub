// admin-dashboard/components/main-view.ts
import { UIComponentDefinition } from '../../../ui-components/services/UIComponentService';
import { systemInfoPanelComponent } from './panels/system-info-panel';
import { moduleManagerPanelComponent } from './panels/module-manager-panel';
import { tupleStoreExplorerPanelComponent } from './panels/tuplestore-explorer-panel';

/**
 * Main view component for Admin Dashboard
 */
export const mainViewComponent: UIComponentDefinition = {
  id: 'admin-dashboard-main-view',
  name: 'Admin Dashboard Main View',
  description: 'Main view for Admin Dashboard',
  category: 'display',
  defaultProps: {
    title: 'Admin Dashboard',
  },
  template: (props) => {
    const { title } = props;
    
    return `
      <div class="admin-dashboard-main-view">
        <h2 class="admin-dashboard-title">${title}</h2>
        <div class="admin-dashboard-content">
          <div class="admin-dashboard-header">
            <div class="system-info-container" id="system-info-container"></div>
          </div>
          <div class="admin-dashboard-grid">
            <div class="grid-column" id="modules-container"></div>
            <div class="grid-column" id="store-container"></div>
          </div>
        </div>
      </div>
    `;
  },
  init: (element, props) => {
    // Component initialization code
    console.log('Admin Dashboard Main View initialized');
    
    // Get containers
    const systemInfoContainer = element.querySelector('#system-info-container');
    const modulesContainer = element.querySelector('#modules-container');
    const storeContainer = element.querySelector('#store-container');
    
    // Get UI component service from the DOM (attached by the ModuleManager)
    const uiComponentService = (window as any).AppletHub?.services?.uiComponentService;
    
    // Render panels if UI service is available
    if (uiComponentService) {
      // System Info Panel
      if (systemInfoContainer) {
        const systemInfoPanel = uiComponentService.createComponent('admin-dashboard-system-info-panel');
        if (systemInfoPanel) {
          systemInfoContainer.appendChild(systemInfoPanel);
        }
      }
      
      // Module Manager Panel
      if (modulesContainer) {
        const moduleManagerPanel = uiComponentService.createComponent('admin-dashboard-module-manager-panel');
        if (moduleManagerPanel) {
          modulesContainer.appendChild(moduleManagerPanel);
        }
      }
      
      // TupleStore Explorer Panel
      if (storeContainer) {
        const tupleStoreExplorerPanel = uiComponentService.createComponent('admin-dashboard-tuplestore-explorer-panel');
        if (tupleStoreExplorerPanel) {
          storeContainer.appendChild(tupleStoreExplorerPanel);
        }
      }
    } else {
      // Fallback message if UI service is not available
      element.querySelector('.admin-dashboard-content')!.innerHTML = `
        <div class="error-message">
          <h3>UI Component Service not available</h3>
          <p>The Admin Dashboard requires the UI Component Service to be registered.</p>
        </div>
      `;
    }
    
    // Return component instance API
    return {
      setTitle: (title: string) => {
        const titleEl = element.querySelector('.admin-dashboard-title');
        if (titleEl) {
          titleEl.textContent = title;
        }
      },
      refresh: () => {
        // Refresh all panels
        const systemInfoPanel = element.querySelector('#system-info-container .system-info-panel');
        if (systemInfoPanel && (systemInfoPanel as any).__componentInstance?.refresh) {
          (systemInfoPanel as any).__componentInstance.refresh();
        }
        
        const moduleManagerPanel = element.querySelector('#modules-container .module-manager-panel');
        if (moduleManagerPanel && (moduleManagerPanel as any).__componentInstance?.refreshModules) {
          (moduleManagerPanel as any).__componentInstance.refreshModules();
        }
      },
      getElement: () => element,
    };
  },
  cleanup: (element) => {
    // Clean up panels
    const systemInfoPanel = element.querySelector('#system-info-container .system-info-panel');
    if (systemInfoPanel && (systemInfoPanel as any).__componentInstance?.cleanup) {
      (systemInfoPanel as any).__componentInstance.cleanup();
    }
    
    const moduleManagerPanel = element.querySelector('#modules-container .module-manager-panel');
    if (moduleManagerPanel && (moduleManagerPanel as any).__componentInstance?.cleanup) {
      (moduleManagerPanel as any).__componentInstance.cleanup();
    }
    
    const tupleStoreExplorerPanel = element.querySelector('#store-container .tuplestore-explorer-panel');
    if (tupleStoreExplorerPanel && (tupleStoreExplorerPanel as any).__componentInstance?.cleanup) {
      (tupleStoreExplorerPanel as any).__componentInstance.cleanup();
    }
  },
  styles: `
    .admin-dashboard-main-view {
      padding: var(--spacing-md, 1rem);
      background-color: var(--color-background, #ffffff);
      border-radius: var(--border-radius-base, 0.375rem);
      box-shadow: var(--shadow-base, 0 1px 3px rgba(0,0,0,0.12));
    }
    
    .admin-dashboard-title {
      margin-top: 0;
      margin-bottom: var(--spacing-md, 1rem);
      color: var(--color-primary, #4a63e6);
    }
    
    .admin-dashboard-content {
      color: var(--color-text, #212529);
    }
    
    .admin-dashboard-header {
      margin-bottom: var(--spacing-md, 1rem);
    }
    
    .admin-dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md, 1rem);
    }
    
    @media (max-width: 768px) {
      .admin-dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .error-message {
      padding: var(--spacing-md, 1rem);
      background-color: rgba(220, 53, 69, 0.1);
      border-radius: var(--border-radius-base, 0.375rem);
      border-left: 4px solid var(--color-error, #dc3545);
    }
    
    .error-message h3 {
      margin-top: 0;
      color: var(--color-error, #dc3545);
    }
  `,
};