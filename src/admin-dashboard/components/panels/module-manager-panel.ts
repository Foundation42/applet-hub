// admin-dashboard/components/panels/module-manager-panel.ts
import { UIComponentDefinition } from '@ui-components/services/UIComponentService';

/**
 * Module Manager Panel
 */
export const moduleManagerPanelComponent: UIComponentDefinition = {
  id: 'admin-dashboard-module-manager-panel',
  name: 'Module Manager Panel',
  description: 'Manage AppletHub modules',
  category: 'display',
  defaultProps: {
    title: 'Module Manager',
    modules: [
      { id: 'core', name: 'Core', version: '0.1.0', status: 'active', required: true },
      { id: 'ui-components', name: 'UI Components', version: '0.1.0', status: 'active', required: true },
      { id: 'admin-dashboard', name: 'Admin Dashboard', version: '0.1.0', status: 'active', required: false },
      { id: 'http-server', name: 'HTTP Server', version: '0.1.0', status: 'inactive', required: false },
      { id: 'websocket-server', name: 'WebSocket Server', version: '0.1.0', status: 'inactive', required: false },
    ]
  },
  template: (props) => {
    const { title, modules = [] } = props;
    
    const renderModuleRows = () => {
      return modules.map(module => {
        const statusClass = module.status === 'active' ? 'status-active' : 'status-inactive';
        const actions = module.required 
          ? '<span class="module-required">Required</span>' 
          : `<button class="action-button ${module.status === 'active' ? 'stop-button' : 'start-button'}" 
              data-action="${module.status === 'active' ? 'stop' : 'start'}" 
              data-module-id="${module.id}">
              ${module.status === 'active' ? 'Stop' : 'Start'}
            </button>`;
        
        return `
          <tr data-module-id="${module.id}">
            <td class="module-name">
              <div class="module-title">${module.name}</div>
              <div class="module-id">${module.id}</div>
            </td>
            <td>${module.version}</td>
            <td><span class="module-status ${statusClass}">${module.status}</span></td>
            <td class="module-actions">${actions}</td>
          </tr>
        `;
      }).join('');
    };
    
    return `
      <div class="admin-dashboard-panel module-manager-panel">
        <div class="panel-header">
          <h3 class="panel-title">${title}</h3>
          <div class="panel-actions">
            <button class="refresh-button" id="refresh-modules">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              Refresh
            </button>
            <button class="install-button" id="install-module">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Install Module
            </button>
          </div>
        </div>
        <div class="panel-content">
          <table class="modules-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Version</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="modules-list">
              ${renderModuleRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  init: (element, props) => {
    let { modules = [] } = props;
    
    // Get elements
    const modulesList = element.querySelector('#modules-list');
    const refreshButton = element.querySelector('#refresh-modules');
    const installButton = element.querySelector('#install-module');
    
    // Handle module actions
    const handleAction = async (action: string, moduleId: string) => {
      // In a real implementation, these would be API calls
      console.log(`${action} module ${moduleId}`);
      
      // Update the module status in our local state
      modules = modules.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            status: action === 'start' ? 'active' : 'inactive'
          };
        }
        return m;
      });
      
      // Re-render the module list
      if (modulesList) {
        modulesList.innerHTML = modules.map(module => {
          const statusClass = module.status === 'active' ? 'status-active' : 'status-inactive';
          const actions = module.required 
            ? '<span class="module-required">Required</span>' 
            : `<button class="action-button ${module.status === 'active' ? 'stop-button' : 'start-button'}" 
                data-action="${module.status === 'active' ? 'stop' : 'start'}" 
                data-module-id="${module.id}">
                ${module.status === 'active' ? 'Stop' : 'Start'}
              </button>`;
          
          return `
            <tr data-module-id="${module.id}">
              <td class="module-name">
                <div class="module-title">${module.name}</div>
                <div class="module-id">${module.id}</div>
              </td>
              <td>${module.version}</td>
              <td><span class="module-status ${statusClass}">${module.status}</span></td>
              <td class="module-actions">${actions}</td>
            </tr>
          `;
        }).join('');
        
        // Re-attach event listeners
        attachActionListeners();
      }
    };
    
    // Attach event listeners to action buttons
    const attachActionListeners = () => {
      const actionButtons = element.querySelectorAll('.action-button');
      actionButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const target = event.currentTarget as HTMLElement;
          const action = target.dataset.action;
          const moduleId = target.dataset.moduleId;
          
          if (action && moduleId) {
            handleAction(action, moduleId);
          }
        });
      });
    };
    
    // Initial attachment of event listeners
    attachActionListeners();
    
    // Handle refresh button
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        console.log('Refreshing module list');
        // In a real implementation, this would fetch the latest module list
        // For now, just simulate a refresh with a small delay
        setTimeout(() => {
          if (modulesList) {
            modulesList.innerHTML = modules.map(module => {
              const statusClass = module.status === 'active' ? 'status-active' : 'status-inactive';
              const actions = module.required 
                ? '<span class="module-required">Required</span>' 
                : `<button class="action-button ${module.status === 'active' ? 'stop-button' : 'start-button'}" 
                    data-action="${module.status === 'active' ? 'stop' : 'start'}" 
                    data-module-id="${module.id}">
                    ${module.status === 'active' ? 'Stop' : 'Start'}
                  </button>`;
              
              return `
                <tr data-module-id="${module.id}">
                  <td class="module-name">
                    <div class="module-title">${module.name}</div>
                    <div class="module-id">${module.id}</div>
                  </td>
                  <td>${module.version}</td>
                  <td><span class="module-status ${statusClass}">${module.status}</span></td>
                  <td class="module-actions">${actions}</td>
                </tr>
              `;
            }).join('');
            
            // Re-attach event listeners
            attachActionListeners();
          }
        }, 500);
      });
    }
    
    // Handle install button
    if (installButton) {
      installButton.addEventListener('click', () => {
        console.log('Install module clicked');
        // In a real implementation, this would open a dialog to install a new module
        alert('Module installation is not implemented in this demo.');
      });
    }
    
    // Return component API
    return {
      refreshModules: () => {
        if (refreshButton) {
          refreshButton.click();
        }
      },
      getModules: () => [...modules],
      updateModules: (newModules: any[]) => {
        modules = newModules;
        if (modulesList) {
          modulesList.innerHTML = modules.map(module => {
            const statusClass = module.status === 'active' ? 'status-active' : 'status-inactive';
            const actions = module.required 
              ? '<span class="module-required">Required</span>' 
              : `<button class="action-button ${module.status === 'active' ? 'stop-button' : 'start-button'}" 
                  data-action="${module.status === 'active' ? 'stop' : 'start'}" 
                  data-module-id="${module.id}">
                  ${module.status === 'active' ? 'Stop' : 'Start'}
                </button>`;
            
            return `
              <tr data-module-id="${module.id}">
                <td class="module-name">
                  <div class="module-title">${module.name}</div>
                  <div class="module-id">${module.id}</div>
                </td>
                <td>${module.version}</td>
                <td><span class="module-status ${statusClass}">${module.status}</span></td>
                <td class="module-actions">${actions}</td>
              </tr>
            `;
          }).join('');
          
          // Re-attach event listeners
          attachActionListeners();
        }
      }
    };
  },
  cleanup: (element) => {
    // Remove event listeners - clone and replace buttons
    const actionButtons = element.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }
    });
    
    const refreshButton = element.querySelector('#refresh-modules');
    if (refreshButton) {
      const newButton = refreshButton.cloneNode(true);
      if (refreshButton.parentNode) {
        refreshButton.parentNode.replaceChild(newButton, refreshButton);
      }
    }
    
    const installButton = element.querySelector('#install-module');
    if (installButton) {
      const newButton = installButton.cloneNode(true);
      if (installButton.parentNode) {
        installButton.parentNode.replaceChild(newButton, installButton);
      }
    }
  },
  styles: `
    .module-manager-panel {
      margin-bottom: var(--spacing-md, 1rem);
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm, 0.5rem);
    }
    
    .panel-title {
      margin: 0;
      font-size: var(--font-size-large, 1.25rem);
      color: var(--color-text, #212529);
    }
    
    .panel-actions {
      display: flex;
      gap: var(--spacing-sm, 0.5rem);
    }
    
    .refresh-button,
    .install-button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background-color: var(--color-background, #ffffff);
      border: 1px solid var(--color-border, #dee2e6);
      border-radius: var(--border-radius-base, 0.375rem);
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-size: var(--font-size-small, 0.875rem);
      transition: background-color 0.2s;
    }
    
    .refresh-button:hover,
    .install-button:hover {
      background-color: var(--color-surface, #f8f9fa);
    }
    
    .panel-content {
      background-color: var(--color-surface, #f8f9fa);
      border-radius: var(--border-radius-base, 0.375rem);
      overflow: hidden;
    }
    
    .modules-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .modules-table th {
      padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
      text-align: left;
      font-weight: 600;
      color: var(--color-text-secondary, #6c757d);
      font-size: var(--font-size-small, 0.875rem);
      border-bottom: 1px solid var(--color-border, #dee2e6);
    }
    
    .modules-table td {
      padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
      border-bottom: 1px solid var(--color-border, #dee2e6);
    }
    
    .modules-table tr:last-child td {
      border-bottom: none;
    }
    
    .module-name {
      min-width: 200px;
    }
    
    .module-title {
      font-weight: 500;
      color: var(--color-text, #212529);
    }
    
    .module-id {
      font-size: var(--font-size-small, 0.875rem);
      color: var(--color-text-secondary, #6c757d);
    }
    
    .module-status {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 50px;
      font-size: var(--font-size-small, 0.875rem);
      font-weight: 500;
    }
    
    .status-active {
      background-color: rgba(40, 167, 69, 0.1);
      color: var(--color-success, #28a745);
    }
    
    .status-inactive {
      background-color: rgba(108, 117, 125, 0.1);
      color: var(--color-text-secondary, #6c757d);
    }
    
    .module-actions {
      text-align: right;
    }
    
    .action-button {
      padding: 0.25rem 0.75rem;
      border-radius: var(--border-radius-base, 0.375rem);
      font-size: var(--font-size-small, 0.875rem);
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .start-button {
      background-color: var(--color-primary, #4a63e6);
      color: white;
    }
    
    .start-button:hover {
      background-color: #3951c6;
    }
    
    .stop-button {
      background-color: var(--color-secondary, #6c757d);
      color: white;
    }
    
    .stop-button:hover {
      background-color: #5a6268;
    }
    
    .module-required {
      font-size: var(--font-size-small, 0.875rem);
      color: var(--color-text-secondary, #6c757d);
      font-style: italic;
    }
  `,
};